import React, { useState } from 'react';
import filterList from './RecommendationDefinition';

export default function RecommendationFilter(props) {
    // Make the default value set.
    const defaultValues = filterList.map((element) => {
        return(element.default);
    });

    // Define a state for filter
    const [filterValues, setFilterValues] = useState(defaultValues);

    // Set a callback function
    const onCallbackChangeFilter = (idx, newValue) => {
        filterValues[idx] = parseInt(newValue);
        setFilterValues([...filterValues]);
    };

    // Compose the tag for all filters.
    // Based on the spec, we should use map() to repeat DOM objects.
    const allFilters = filterList.map((filterInfo, idx) => {
        return (
            <RecommendationFilterItem key={filterInfo.id} idx={idx} filterInfo={filterInfo} filterValues={filterValues} onCallbackChangeFilter={onCallbackChangeFilter} />
        )
    });

    return (
        <form onSubmit={props.onFormSubmit}>
            <div className="filter-container">
                {allFilters}

                <div className="filter-submit">
                    <input type="submit" className="submit-button" value="Pick songs" />
                </div>
            </div>
        </form>
    );
}

export function RecommendationFilterItem(props) {
    const filter = props.filterInfo;
    const filderId = "filter_" + filter.id;
    const value = props.filterValues[props.idx];
    
    // onChange event for filter slider bars
    const onChangeFilter = (event) => {
        const newValue = event.target.value;
        props.onCallbackChangeFilter(props.idx, newValue);
    };

    return (
        <div className="filter-element">
            <label htmlFor={filderId}>{filter.name}</label>
            <input id={filderId} type="range" className="filter-input" onChange={onChangeFilter} min="0" max="2" step="1" value={value} />
        </div>
    );
}
