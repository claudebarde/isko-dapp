pragma solidity 0.5.16;

// Import base Initializable contract
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import { SafeMath } from "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

contract IskoDapp is Initializable {
    address payable private owner;
    uint public fee;
    enum JobStatus { Available, Accepted, Delivered, Review, PaidOut, Cancelled }
    struct Job {
        address payable customer;
        uint price;
        uint timestamp;
        JobStatus status;
        address payable translator;
        uint deliveredOn;
    }
    mapping(string => Job) public jobs;
    mapping(address => uint) public translators;
    uint256 generalRevenue;
    
    modifier onlyOwner {
        require(msg.sender == owner, "You are not allowed to perform this action!");
        _;
    }
    
    modifier validateRequest (string memory _id) {
        require(translators[msg.sender] > 0, "Only active translators can accept new jobs!");
        require(jobs[_id].timestamp > 0, "This job doesn't exist!");
        _;
    }

    event NewJob(string id, uint price); // event when new job is created
    event JobCanceledByTranslator(string id); // translator cancel job, job is now available
    event DeliverJob(string id); // when translator finishes a job
    event JobPayOut(string id, uint price); // event when translator asks for payout
    event JobCanceledByCustomer(string id); // when customer cancels a job
    
    function initialize (address payable sender) public {
        owner = sender;
        fee = 10; // fee in percentage
        generalRevenue = 0;
    }
    
    // adds a new translator
    function addNewTranslator () public payable {
        require(translators[msg.sender] == 0, "This translator already exists!");
        require(msg.value > 0, "There is no ether sent with this transaction.");
        translators[msg.sender] = msg.value;
    }
    
    // returns translator balance
    function returnTranslator (address _translator) public view returns (uint) {
        return translators[_translator];
    }
    
    // adds new job from customer
    function addNewJob (address payable _customer, string memory _id) public payable {
        // customer must provide a price that includes the fee
        require(msg.value > 0, "The provided amount is too low.");
        // customer cannot override an existing job
        require(jobs[_id].timestamp == 0, "This job already exists.");
        // we calculate fee on the job
        uint localFee = msg.value * fee / 100;
        // we create a new job
        Job memory newJob = Job({
            customer: _customer,
            price: msg.value - localFee,
            timestamp: now,
            status: JobStatus.Available,
            translator: address(0),
            deliveredOn: 0
        });
        // we push the job into the job list
        jobs[_id] = newJob;
        // we increment general revenue variable
        generalRevenue = SafeMath.add(generalRevenue, localFee);
        // emit event
        emit NewJob(_id, newJob.price);
    } 
    
    // translator accepts job from job market
    function acceptJob (string memory _id) public validateRequest(_id) {
        // checks job is still available
        require(jobs[_id].status == JobStatus.Available, "This job is no longer available");
        // job data are changed
        jobs[_id].status = JobStatus.Accepted;
        jobs[_id].translator = msg.sender;
    }
    
    // translator cancels job
    function cancelJob (string memory _id) public {
        // must be translator who accepted the job or owner
        require(jobs[_id].translator == msg.sender || msg.sender == owner, "You are not allowed to cancel this job!");
        // job cannot be in other state but "accepted"
        require(jobs[_id].status == JobStatus.Accepted, "You cannot cancel this job anymore!");
        // reset job info
        jobs[_id].status = JobStatus.Available;
        jobs[_id].translator = address(0);
        // emit event to inform about job availability
        emit JobCanceledByTranslator(_id);
    }
    
    // translator delivers job
    function deliverJob (string memory _id) public validateRequest(_id) {
        require(jobs[_id].status == JobStatus.Accepted || jobs[_id].status == JobStatus.Review, "This job doesn't have the required status!");
        // changes status of job
        jobs[_id].status = JobStatus.Delivered;
        jobs[_id].deliveredOn = now;
        // new job delivered
        emit DeliverJob(_id);
    }
    
    // customer asks for job review
    function reviewJob (string memory _id) public {
        require(jobs[_id].customer == msg.sender, "You don't have access to this job.");
        jobs[_id].status = JobStatus.Review;
    }
    
    // 5 days after job delivery, job is available to be paid out
    function payOutJob (string memory _id) public validateRequest(_id) {
        // verifies it has been at least 5 days since delivering
        require(jobs[_id].deliveredOn + 5 days > now, "This job is not available for payment.");
        // verifies right status for the job
        require(jobs[_id].status == JobStatus.Delivered || jobs[_id].status == JobStatus.Review, "This job hasn't been delivered yet.");
        // changes status of job
        jobs[_id].status = JobStatus.PaidOut;
        // increase translator balance
        translators[msg.sender] = translators[msg.sender] + jobs[_id].price;
        // emit event
        emit JobPayOut(_id, jobs[_id].price);
    }
    
    // cancels and refunds job
    function refundJob (string memory _id) public onlyOwner {
        // prevents customer to cancel the job after translator worked on it
        require(jobs[_id].status == JobStatus.Available, "You cannot cancel this job anymore!");
        Job storage job = jobs[_id];
        // refunds price
        job.customer.transfer(job.price);
        // removes job
        job.customer = address(0x0);
        job.price = 0;
        job.timestamp = 0;
        job.status = JobStatus.Available;
        job.translator = address(0x0);
        job.deliveredOn = 0;
        // emit event about job cancelation
        emit JobCanceledByCustomer(_id);
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
        owner.transfer(generalRevenue);
    }
    
    // modify fee
    function changeFee (uint _fee) public onlyOwner {
        fee = _fee;
    }
    
    // in case of direct payments
    //receive() external payable {}
    
}