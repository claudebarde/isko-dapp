pragma solidity ^0.5.0;

contract IskoEth {
    address payable private owner;
    uint public fee;
    struct Job {
        address payable customer;
        uint price;
        uint timestamp;
        bool status; // false => job not approved - true => job approved
    }
    mapping(uint => Job) public jobs;
    mapping(address => uint) public translators;
    
    modifier onlyOwner {
        require(msg.sender == owner, "You are not allowed to perform this action!");
        _;
    }
    
    constructor () public {
        owner = msg.sender;
        fee = 66000000000000;
    }
    
    // adds a new translator
    function addNewTranslator () payable public {
        require(translators[msg.sender] == 0, "This translator already exists!");
        require(msg.value > 0, "There is no ether sent with this transaction.");
        translators[msg.sender] = msg.value;
    }
    
    // returns translator balance
    function returnTranslator (address _translator) view public returns (uint) {
        return translators[_translator];
    }
    
    // adds new job from customer
    function addNewJob (address payable _customer, uint _id) public payable {
        // customer must provide a price that includes the fee
        require(msg.value > fee, "The provided amount is too low.");
        // customer cannot override an existing job
        require(jobs[_id].timestamp > 0, "This job already exists.");
        // we create a new job
        Job memory newJob = Job({
            customer: _customer,
            price: msg.value,
            timestamp: now,
            status: false
        });
        // we push the job into the mapping
        jobs[_id] = newJob;
    } 
    
    // transfers money to translator after job is approved by customer
    function approveJob(uint _id, address payable _client, address payable _translator) public {
        // updates job status
        Job storage job = jobs[_id];
        // user updating job must be user who created it
        require(job.customer == _client || msg.sender == owner, "You are not allowed to perform this action");
        // job update
        job.status = true;
        // updates translator balance
        uint translatorBalance = translators[_translator];
        uint newBalance = translatorBalance + job.price;
        translators[_translator] = newBalance;
    }
    
    // refunds job if cancelled
    function refundJob (uint id) public onlyOwner {
        Job storage job = jobs[id];
        job.customer.transfer(job.price);
    }
    
    // pays freelancer on request
    function payTranslator () public {
        // address must be registered
        // 10 wei are left in the balance to keep the account active
        require(translators[msg.sender] > 10, "Your balance is empty");
        uint balance = translators[msg.sender] - 10;
        msg.sender.transfer(balance);
    }
    
    // withdraw contract balance
    function withdrawBalance () public onlyOwner {
        owner.transfer(address(this).balance);
    }
    
    // modify fee
    function changeFee (uint _fee) public onlyOwner {
        fee = _fee;
    }
    
    // in case of direct payments
    function() external payable {}
    
}