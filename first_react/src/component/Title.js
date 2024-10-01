import React from 'react';
import bootstrapCss from '../css/bootstrap.module.css';


function Title() {
    return (
        <div className={`${bootstrapCss.title}`}>
            <div>  <span>So sánh giữa </span>
                <span className = {bootstrapCss.mongoDB}>MongoDB</span>
                <span> và </span>
                <span className = {bootstrapCss.cassandra}>Cassandra</span>
            </div>
        </div>
    )
}
export default Title;