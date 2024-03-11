import React from "react";
import { render } from "react-dom";

const App = () => {
    return (
        <div>
            <p>Hello World!</p>
        </div>
    );
};

render(<App />, document.getElementById("root"));