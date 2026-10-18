import { useState} from "react";
import { JobFilter } from "../utils/Api";
import './Search.scss';

export default function SearchBar({setJobs}) { 
    const [searchFor, setsearchFor] = useState('all');
    const [sortBy, setsortBy] = useState('recent');
    const [searchBar, setSearchBar] = useState('');
    const searchBy = [
    { id: "keyword", name: "Keywords" },
    { id: "location", name: "Location" },
    { id: "category", name: "Category" }
    ];

    const orderBy = [
    { id: "recent", name: "Most recent" },
    { id: "salaryDesc", name: "Salary: high to low" },
    { id: "salaryAsc", name: "Salary: low to high" },
    { id: "titleAsc", name: "Title A-Z" }
    ];
    

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            const results = await JobFilter(searchFor, sortBy, searchBar);
            
            setJobs(results);
        } catch (error) {
            console.error("Failed to fetch filtered jobs:", error);
        }
    };

    return(
        <form id="job-search-form" onSubmit={handleSearchSubmit}>
            <section className="inside">
                <select
                    className="dropdown"
                    value={searchFor}
                    onChange={(e) => setsearchFor(e.target.value)}
                >
                    {searchBy.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <select
                    className="dropdown"
                    value={sortBy}
                    onChange={(e) => setsortBy(e.target.value)}
                >
                    {orderBy.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <input
                    id="searchBar"
                    type="text"
                    placeholder="Type to Search"
                    value={searchBar}
                    onChange={(e) => setSearchBar(e.target.value)}
                />

                <button className="formBtn" type="submit">
                    Search ⌕
                </button>
            </section>
        </form>
    )
}