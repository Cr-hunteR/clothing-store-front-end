import React, { useCallback, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Users from "./admin/pages/admins";
import MainNavigation from "./common/components/navigation/main-navigation";
import Auth from "./admin/pages/authentication";
import { AuthContext } from "./common/context/auth-context";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid) => {
    setIsLoggedIn(true);
    setUserId(uid);
    
  }, []);
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId(null);
  }, []); //we have use callback here because we do not need to recreate(rerender) this element to the unwanted changes of the states and to prevent from infinite loops.

  let routes;
  if (isLoggedIn) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users></Users>
        </Route>
        
        
        
        <Redirect to="/"></Redirect>
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users></Users>
        </Route>
        
        <Route path="/auth">
          <Auth></Auth>
        </Route>
        <Redirect to="/auth"></Redirect>
      </Switch>
    );
  }
  return (
    <AuthContext.Provider
      value={{ isLoggedIn: isLoggedIn,userId:userId, login: login, logout: logout }}
    >
      <Router>
        <Route path="/">
          <MainNavigation></MainNavigation>
        </Route>
        <main>
          {routes}
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
