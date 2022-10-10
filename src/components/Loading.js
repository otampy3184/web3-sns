import React from "react";
import { BallTriangle } from 'react-loader-spinner'

function Loading({ inverted = true, content = "Loading..." }) {
    return (
            < BallTriangle
                type="Puff"
                color="#00BFFF"
                height="40"
                width="40"
                timeout={3000}
            />
    )
}

export default Loading;