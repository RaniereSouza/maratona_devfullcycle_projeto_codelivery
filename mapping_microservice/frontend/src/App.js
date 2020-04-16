import React                            from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { SnackbarProvider } from "notistack";

import Mapping from "./pages/Mapping";

import './App.css';

function App() {
    return (
        <SnackbarProvider>
            <BrowserRouter>
                <Switch>
                    <Route path={'/orders/:id/mapping'} component={Mapping} exact={true}/>
                </Switch>
            </BrowserRouter>
        </SnackbarProvider>
    );
}

export default App;
