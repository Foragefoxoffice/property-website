import React from 'react';
import './Loader.css';

const Loader = () => {
    return (
        <div className="loader-wrapper">
            <div className="house-container">
                <div className="house-roof"></div>
                <div className="house-walls"></div>
                <div className="house-door"></div>
                <div className="shadows"></div>
            </div>

            <div className="loading-text-container">
                <div className="loading-title">LOADING</div>
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};

export default Loader;
