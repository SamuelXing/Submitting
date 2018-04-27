pragma solidity ^0.4.17;

contract SubmitContract
{

    mapping(bytes32=>bytes32[]) projects;
    
    
    function submit(bytes32 name, bytes32 hashValue) public returns(uint)
    {
        if(projects[name].length == 0)
        {
            projects[name].push(hashValue);
        }
        else
        {
            for(uint i=0; i<projects[name].length; i++)
            {
                require(projects[name][i] != hashValue);
            }
            projects[name].push(hashValue);
        }
        
        return projects[name].length;
    }
    
    function getHashList(bytes32 name) public view returns(bytes32[])
    {
        assert(projects[name].length != 0);
        bytes32[] memory hashlist = new bytes32[](projects[name].length);
        for(uint i=0; i< projects[name].length; i++)
        {
            hashlist[i] =  projects[name][i];
        }
        return hashlist;
    }
    
}
