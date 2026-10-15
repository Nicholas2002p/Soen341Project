import { useState, useEffect } from "react";
import { JobFilter } from "../utils/Api";
import { useAuth } from '../utils/Auth';
import './Search.scss';

export default function SearchBar(setJobs) { 
    const {token} = useAuth();
    const [dropdownOne, setDropdownOne] = useState('all');
    const [dropdownTwo, setDropdownTwo] = useState('recent');
    const [searchBar, setSearchBar] = useState('');
    const optionsOne = [
    { id: "all", name: "All fields" },
    { id: "title", name: "Job title" },
    { id: "recruiter", name: "Company" },
    { id: "description", name: "Description" },
    { id: "location", name: "Location" },
    { id: "skill", name: "Skills" },
    ];

    const optionsTwo = [
    { id: "recent", name: "Most recent" },
    { id: "salaryDesc", name: "Salary: high to low" },
    { id: "salaryAsc", name: "Salary: low to high" },
    { id: "titleAsc", name: "Title A-Z" },
    ];
    

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            const results = await JobFilter(dropdownOne, dropdownTwo, searchBar, token);
            
            setJobs(results);
        } catch (error) {
            console.error("Failed to fetch filtered jobs:", error);
        }
    };

    return(
        <form id="jobSearchForm" onSubmit={handleSearchSubmit}>
            <select
                className="dropdown"
                value={dropdownOne}
                onChange={(e) => setDropdownOne(e.target.value)}
            >
                {optionsOne.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>

            <select
                className="dropdown"
                value={dropdownTwo}
                onChange={(e) => setDropdownTwo(e.target.value)}
            >
                {optionsTwo.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>

            <input
                id="searchBar"
                type="text"
                placeholder="Search"
                value={searchBar}
                onChange={(e) => setSearchBar(e.target.value)}
            />

            <button className="formBtn" type="submit">
                Search
            </button>
        </form>
    )
}