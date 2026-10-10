import { useState, useEffect } from "react";
import { JobFilter, GetOptionsApi } from "../utils/Api";
import { useAuth } from '../utils/Auth';
import './Search.scss';

export default function SearchBar(setJobs) { 
    const { token} = useAuth();
    const [dropdownOne, setDropdownOne] = useState('');
    const [dropdownTwo, setDropdownTwo] = useState('');
    const [searchBar, setSearchBar] = useState('');
    const [optionsOne, setOptionsOne] = useState([
        { id: null, name: "Option 1" }
    ]);
    const [optionsTwo, setOptionsTwo] = useState([
        { id: null, name: "Option 2" }
    ]);
    
    useEffect(() => {
        const getOptions = async () => {
            //check to see if token is needed
            const data = await GetOptionsApi(token);
            if (!data) return;
            //change to propername later
            setOptionsOne(data.one)
            setOptionsTwo(data.two)

        };
        getOptions();

    }, []);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        await JobFilter(dropdownOne,dropdownTwo,searchBar, token);
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