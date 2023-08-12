pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SimpleToken is ERC20, Ownable {
    uint256 private _totalVested;
    mapping(address => uint256) private _vestedBalances;
    mapping(address => uint256) private _vestingStart;
    address public manager;

    modifier onlyManager() {
        require(
            manager == msg.sender,
            "Only the Manager can perform this action"
        );
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address _manager
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        manager = _manager;
    }

    event VestingStarted(
        address indexed beneficiary,
        uint256 tokens,
        uint256 startTime,
        uint256 endTime
    );
    event TokensClaimed(address indexed beneficiary, uint256 tokens);

    function setNewManager(address _newManager) external onlyManager {
        manager = _newManager;
    }

    function totalVested() public view returns (uint256) {
        return _totalVested;
    }

    function vestedBalanceOf(address account) public view returns (uint256) {
        return _vestedBalances[account];
    }

    function vestingStart(address account) public view returns (uint256) {
        return _vestingStart[account];
    }

    function vestTokens(
        address beneficiary,
        uint256 tokens,
        uint256 duration
    ) public onlyManager {
        require(tokens > 0, "Tokens must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");
        require(
            _vestingStart[beneficiary] == 0,
            "Vesting has already been started for this address"
        );

        uint256 currentTime = block.timestamp;
        _vestingStart[beneficiary] = currentTime;
        _vestedBalances[beneficiary] = tokens;
        _totalVested = _totalVested - tokens;

        emit VestingStarted(
            beneficiary,
            tokens,
            currentTime,
            currentTime + duration
        );
    }

    function claimVestedTokens() public {
        require(
            _vestingStart[msg.sender] > 0,
            "Vesting has not been started for this address"
        );

        uint256 currentTime = block.timestamp;
        uint256 vestingStart_ = _vestingStart[msg.sender];
        uint256 vestingDuration = currentTime - vestingStart_;
        uint256 totalTokens = _vestedBalances[msg.sender];

        require(vestingDuration > 0, "Vesting duration has not started yet");
        require(totalTokens > 0, "No tokens to claim");

        uint256 unlockedTokens = (totalTokens * vestingDuration) / (365 days);

        if (unlockedTokens >= totalTokens) {
            unlockedTokens = totalTokens;
            delete _vestingStart[msg.sender];
            delete _vestedBalances[msg.sender];
        } else {
            _vestedBalances[msg.sender] = totalTokens - unlockedTokens;
        }

        _transfer(address(this), msg.sender, unlockedTokens);

        emit TokensClaimed(msg.sender, unlockedTokens);
    }

    function mint(address _receiver, uint256 _amount) external onlyManager {
        _mint(_receiver, _amount);
    }

    function withdrawExcessEth(address _reciever) external onlyManager {
        payable(_reciever).transfer(address(this).balance);
    }

    function withdrawExcessToken(address _reciever, ERC20 _token)
        external
        onlyManager
    {
        _token.transfer(_reciever, _token.balanceOf(address(this)));
    }

    function selfDestruct(address payable _recipient) public onlyOwner {
        require(_recipient != address(0), "Invalid recipient address");
        selfdestruct(_recipient);
    }
}

contract StakingPool is Ownable {
    using SafeMath for uint256;

    ERC20 public propertyToken; // The property token that can be staked
    ERC20 public rewardToken; // The reward token that users can earn
    uint256 public rewardPerToken; // Amount of reward tokens per staked property token

    struct StakerInfo {
        uint256 stakedAmount;
        uint256 lastUpdateTime;
        uint256 pendingRewards;
    }

    mapping(address => StakerInfo) public stakers;
    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event RewardsClaimed(address indexed staker, uint256 amount);

    constructor(
        address _propertyToken,
        address _rewardToken,
        uint256 _rewardPerToken
    ) {
        require(_propertyToken != address(0), "Invalid property token address");
        require(_rewardToken != address(0), "Invalid reward token address");
        require(
            _rewardPerToken > 0,
            "Reward per token must be greater than zero"
        );

        propertyToken = ERC20(_propertyToken);
        rewardToken = ERC20(_rewardToken);
        rewardPerToken = _rewardPerToken;
    }

    // Stake property tokens
    function stake(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");

        StakerInfo storage staker = stakers[msg.sender];

        // Update staker's pending rewards
        updatePendingRewards(staker);

        // Update staker's staked amount and last update time
        staker.stakedAmount = staker.stakedAmount.add(_amount);
        staker.lastUpdateTime = block.timestamp;
        emit Staked(msg.sender, _amount);
    }

    // Unstake property tokens
    function unstake(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");

        StakerInfo storage staker = stakers[tx.origin];
        require(staker.stakedAmount >= _amount, "Insufficient staked amount");

        // Update staker's pending rewards before unstaking
        updatePendingRewards(staker);

        // Transfer property tokens back to the staker
        propertyToken.transfer(tx.origin, _amount);

        // Update staker's staked amount and last update time
        staker.stakedAmount = staker.stakedAmount.sub(_amount);
        staker.lastUpdateTime = block.timestamp;

        emit Unstaked(tx.origin, _amount);
    }

    // Claim pending rewards
    function claimRewards() public {
        StakerInfo storage staker = stakers[msg.sender];
        require(staker.pendingRewards > 0, "No pending rewards");

        // Transfer reward tokens to the staker
        rewardToken.transfer(msg.sender, staker.pendingRewards);

        // Reset staker's pending rewards
        staker.pendingRewards = 0;

        emit RewardsClaimed(msg.sender, staker.pendingRewards);
    }

    // Update pending rewards for a staker
    function updatePendingRewards(StakerInfo storage _staker) internal {
        if (_staker.stakedAmount > 0) {
            uint256 currentTime = block.timestamp;
            uint256 elapsedTime = currentTime.sub(_staker.lastUpdateTime);

            // Calculate pending rewards based on staked amount and elapsed time
            uint256 pendingRewards = _staker
                .stakedAmount
                .mul(elapsedTime)
                .mul(rewardPerToken)
                .div(1 days).div(1e18);

            // Update staker's pending rewards
            _staker.pendingRewards = _staker.pendingRewards.add(pendingRewards);

            // Update staker's last update time
            _staker.lastUpdateTime = currentTime;
        }
    }

    // Set the reward per token (only owner can call this)
    function setRewardPerToken(uint256 _rewardPerToken) public onlyOwner {
        require(
            _rewardPerToken > 0,
            "Reward per token must be greater than zero"
        );
        rewardPerToken = _rewardPerToken;
    }

    function withdrawExcessEth(address _reciever) external onlyOwner {
        payable(_reciever).transfer(address(this).balance);
    }

    function withdrawExcessToken(address _reciever, ERC20 _token)
        external
        onlyOwner
    {
        _token.transfer(_reciever, _token.balanceOf(address(this)));
    }
}

contract RealEstateContract is Ownable, Pausable {
    using SafeMath for uint256;

    // Property details
    struct Property {
        string propertyAddress;
        address owner;
        uint256 totalSupply;
        uint256 initialPrice;
        SimpleToken token;
        address stakingPool;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
        bool executed;
        address[] voters;
    }

    struct Escrow {
        uint256 propertyId;
        address buyer;
        uint256 amount;
        bool completed;
        uint256 ethAmount;
    }

    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(
            properties[_propertyId].owner == msg.sender,
            "Only the property owner can perform this action"
        );
        _;
    }
    // Property tokenization
    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;
    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;

    // Token staking
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public stakingStartTime;
    mapping(address => uint256) public rewardPercent;

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256 public votingDuration; // Duration in seconds for which voting is open

    // Events
    event PropertyTokenized(
        uint256 propertyId,
        uint256 totalSupply,
        string propertyAddress,
        address indexed tokenAddress
    );
    event PropertyListedForSale(uint256 propertyId, uint256 pricePerToken);

    event TokenPurchased(
        address buyer,
        uint256 propertyId,
        uint256 amount,
        uint256 totalPrice
    );
    event StakingPoolCreated(uint256 propertyId, address indexed stakingPool);
    event PropertyStaked(address sender, uint256 propertyId, uint256 amount);
    event EscrowCancelled(uint256 propertyId, address buyer, uint256 amount);
    event PropertyRemovedFromListing(uint256 propertyId);
    event ProposalCreated(uint256 proposalId, string description);
    event Voted(uint256 proposalId, address indexed voter);
    event ProposalExecuted(uint256 proposalId);
    event EscrowCreated(
        uint256 escrowId,
        address buyer,
        uint256 propertyId,
        uint256 amount
        
    );
    event EscrowReleased(
        uint256 escrowId,
        uint256 propertyId,
        address indexed buyer,
        uint256 amount
    );

   function initialize() external{
        votingDuration = 7 days; // Default voting duration is 7 days
    }

    

    // Function to create and issue a new real estate token representing a specific property
    function createPropertyToken(
        string memory _address,
        uint256 _totalSupply,
        uint256 _initialPrice,
        string memory _tokenName,
        string memory _tokenSymbol,
        address _manager
    ) public onlyOwner returns(SimpleToken) {
        require(_totalSupply > 0, "Total supply must be greater than zero");

        SimpleToken propertyToken = new SimpleToken(
            _tokenName,
            _tokenSymbol,
            _totalSupply,
            _manager
        );

        uint256 newPropertyId = propertyCount;
        properties[newPropertyId] = Property({
            propertyAddress: _address,
            owner:_manager,
            totalSupply: _totalSupply,
            initialPrice: _initialPrice,
            token: propertyToken,
            stakingPool: address(0)
        });

        propertyCount++;

        emit PropertyTokenized(
            newPropertyId,
            _totalSupply,
            _address,
            address(propertyToken)
        );
        return propertyToken;
    }

    // Function to list the real estate tokens on a decentralized marketplace for sale
    function listPropertyForSale(uint256 _propertyId, uint256 _pricePerToken)
        public
        onlyPropertyOwner(_propertyId)
    {
        require(_propertyId < propertyCount, "Invalid property ID");
        require(
            _pricePerToken > 0,
            "Price per token must be greater than zero"
        );

        properties[_propertyId].initialPrice = _pricePerToken;
        emit PropertyListedForSale(_propertyId, _pricePerToken);
    }

    // Function to unlist property
    function removeFromListing(uint256 _propertyId) public onlyOwner {
        require(_propertyId < propertyCount, "Invalid property ID");

        // Cancel any associated escrow
        Escrow storage escrow = escrows[_propertyId];
        if (!escrow.completed) {
            // Refund the escrowed amount to the buyer
            payable(escrow.buyer).transfer(escrow.amount);
            escrow.completed = true;
            emit EscrowCancelled(_propertyId, escrow.buyer, escrow.amount);
        }

        // Reset the property's initial price and staking pool
        properties[_propertyId].initialPrice = 0;
        properties[_propertyId].stakingPool = address(0);

        emit PropertyRemovedFromListing(_propertyId);
    }

    // Function to purchase tokens and put them in escrow
    function purchaseTokensAndEscrow(uint256 _propertyId, uint256 _amount)
        public
        payable
        whenNotPaused
    {
        require(_propertyId < propertyCount, "Invalid property ID");
        require(
            properties[_propertyId].initialPrice > 0,
            "Property not listed for sale"
        );
        require(_amount > 0, "Amount must be greater than zero");
        require(
            msg.value ==
                _amount.mul(properties[_propertyId].initialPrice).div(1e18),
            "Incorrect payment amount"
        );

        uint256 totalPrice = _amount
            .mul(properties[_propertyId].initialPrice)
            .div(1e18);

        // Create escrow
        Escrow memory newEscrow = Escrow({
            propertyId: _propertyId,
            buyer: msg.sender,
            amount: _amount,
            completed: false,
            ethAmount: totalPrice
        });

        escrows[escrowCount] = newEscrow;
        escrowCount++;

        emit TokenPurchased(msg.sender, _propertyId, _amount, totalPrice);
        emit EscrowCreated(
            escrowCount - 1,
            msg.sender,
            _propertyId,
            _amount
        );

        // Transfer tokens to contract (held in escrow)
    }

    // Function to release escrowed tokens
    function releaseEscrow(uint256 _escrowId) public onlyOwner {
        require(_escrowId < escrowCount, "Invalid escrow ID");
        Escrow storage escrow = escrows[_escrowId];
        require(!escrow.completed, "Escrow already completed");

        // Mark escrow as completed
        escrow.completed = true;

        // Transfer tokens to the buyer
        IERC20(properties[escrow.propertyId].token).transfer(
            escrow.buyer,
            escrow.amount
        );
        payable(SimpleToken(properties[escrow.propertyId].token).manager()).transfer(escrow.ethAmount);
        emit EscrowReleased(
            _escrowId,
            escrow.propertyId,
            escrow.buyer,
            escrow.amount
        );
    }

    // Function to create a new staking pool for a property
    function createStakingPool(
        uint256 _propertyId,
        address _rewardToken,
        uint256 _rewardPerToken
    ) public onlyOwner {
        require(_propertyId < propertyCount, "Invalid property ID");
        require(
            properties[_propertyId].stakingPool == address(0),
            "Staking pool already created"
        );
        require(_rewardToken != address(0), "Invalid reward token address");
        require(
            _rewardPerToken > 0,
            "Reward per token must be greater than zero"
        );

        StakingPool stakingPoolContract = new StakingPool(
            address(properties[_propertyId].token),
            _rewardToken,
            _rewardPerToken
        );

        properties[_propertyId].stakingPool = address(stakingPoolContract);

        emit StakingPoolCreated(_propertyId, address(stakingPoolContract));
    }

    // Function to stake property tokens
    function stakePropertyTokens(uint256 _propertyId, uint256 _amount) public {
        require(_propertyId < propertyCount, "Invalid property ID");
        require(
            properties[_propertyId].stakingPool != address(0),
            "Staking pool not created"
        );
        require(_amount > 0, "Amount must be greater than zero");
        properties[_propertyId].token.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
         properties[_propertyId].token.transfer(
            address(properties[_propertyId].stakingPool),
            _amount
        );
        StakingPool(properties[_propertyId].stakingPool).stake(_amount);
        emit PropertyStaked(msg.sender, _propertyId, _amount);
    }

    // Pause and unpause functions for emergency situations
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Function to create a new proposal
    function createProposal(string memory _description) public onlyOwner {
        proposals[proposalCount] = Proposal({
            description: _description,
            voteCount: 0,
            executed: false,
            voters: new address[](0)
        });

        emit ProposalCreated(proposalCount, _description);
        proposalCount++;
    }

    // Function to vote on a proposal
    function voteOnProposal(uint256 _proposalId) public {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        require(
            properties[0].token.balanceOf(msg.sender) > 0,
            "Must hold property tokens to vote"
        );

        Proposal storage proposal = proposals[_proposalId];
        require(
            !hasVoted(proposal.voters, msg.sender),
            "Already voted on this proposal"
        );

        proposal.voters.push(msg.sender);
        proposal.voteCount++;

        emit Voted(_proposalId, msg.sender);
    }

    // Function to check if an address has voted in a proposal
    function hasVoted(address[] memory _voters, address _voter)
        internal
        pure
        returns (bool)
    {
        for (uint256 i = 0; i < _voters.length; i++) {
            if (_voters[i] == _voter) {
                return true;
            }
        }
        return false;
    }

    // Function to execute a proposal
    function executeProposal(uint256 _proposalId) public onlyOwner {
        require(_proposalId < proposalCount, "Invalid proposal ID");

        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(
            block.timestamp >= proposal.voteCount.add(votingDuration),
            "Voting period not over"
        );

        // Perform the actions specified in the proposal
        // For demonstration purposes, let's emit an event indicating proposal execution
        emit ProposalExecuted(_proposalId);

        // Mark the proposal as executed
        proposal.executed = true;
    }

    function withdrawExcessEth(address _reciever) external onlyOwner {
        payable(_reciever).transfer(address(this).balance);
    }

    function withdrawExcessToken(address _reciever, ERC20 _token)
        external
        onlyOwner
    {
        _token.transfer(_reciever, _token.balanceOf(address(this)));
    }

    function destroyPropertyToken(SimpleToken _token) external onlyOwner{
        _token.selfDestruct(payable(msg.sender));
    }
}
