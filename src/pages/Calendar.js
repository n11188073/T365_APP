import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Calendar = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Itineraries</h1>
        <FontAwesomeIcon icon={faPlus} className="header-icon" />
      </div>

      <p>
        Itinary Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
        convallis velit non lectus imperdiet.
      </p>

      {/* Card */}
      <div className="card">
        <h2>Testing Card</h2>
        <p>Itinary Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
        convallis velit non lectus imperdiet.</p>
      </div>
    </div>
  );
};

export default Calendar;
