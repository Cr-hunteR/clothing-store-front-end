import React, { useCallback, useState, useEffect } from 'react';

import './App.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Users from './admin/pages/admins';
import Categories from './category/pages/categories';
import ProductsByCat from './components/products/ProductsByCat';
import MainNavigation from './Common/components/navigation/main-navigation';
import NewCategory from './category/pages/new-category';
import NewProduct from './components/products/new-product';
import Product from './components/view-product/product';
import Auth from './admin/pages/authentication';
import { AuthContext } from './Common/context/auth-context';
import Cart from './components/cart/cart.component';
import WishListPage from './components/wishlist/wishlistpage';
import setAxiosToken from './axiosutils/setAxiosToken';

function App () {
	const [ token, setToken ] = useState(false);
	const [ userId, setUserId ] = useState(false);
	const [ tokenExpAuto, setTokenExpAuto ] = useState();

	let logoutTime;

	const login = useCallback((uid, token, tokenExpDate) => {
		setToken(token);
		setUserId(uid);
		let tokenExp;
		if (!tokenExpDate) {
			tokenExp = new Date(new Date().getTime() + 10000 * 60 * 60 * 24); //Creating a new Expiration date => current time+1hr
			setTokenExpAuto(tokenExp);
		} else {
			tokenExp = tokenExpDate; //Assigning the old date
			setTokenExpAuto(tokenExp);
		}
		localStorage.setItem(
			'userData',
			JSON.stringify({
				userId: uid,
				token: token,
				tokenExp: tokenExp.toISOString() //setting expiration time for the token we have storing in the local storage
			})
		);
		setAxiosToken(token);
	}, []);
	const logout = useCallback(() => {
		setToken(false);
		setUserId(null);
		setTokenExpAuto(null);
		localStorage.removeItem('userData');
		setAxiosToken(null);
	}, []); //we have use callback here because we do not need to recreate(rerender) this element to the unwanted changes of the states and to prevent from infinite loops.

	//Managing token expiration
	/* 
    we have set 1hr to expire the token in the backend.
    but still we have to manually expire the token which we have stored on the local storage.
    Therfore, we have call the localstorage.removeItem in logout function.
    yet we have to handle that logout to happen automatically using a useEffect.
    2nd useEffect is here for that.
  */
	useEffect(
		() => {
			const storedData = JSON.parse(localStorage.getItem('userData'));
			if (storedData && storedData.token && new Date(storedData.tokenExp) > new Date()) {
				login(storedData.userId, storedData.token, new Date(storedData.tokenExp));
			}
		},
		[ login ]
	);
	//Auto logout, when time expires
	useEffect(
		() => {
			if (token && tokenExpAuto) {
				const timer = tokenExpAuto.getTime() - new Date().getTime();
				logoutTime = setTimeout(logout, timer); //Executes the function, after waiting a specified number of milliseconds.
			} else {
				clearTimeout(logoutTime);
			}
		},
		[ token, logout, tokenExpAuto ]
	);

	let routes;
	if (token) {
		routes = (
			<Switch>
				<Route path='/' exact>
					<Categories />
				</Route>

				<Route path='/users' exact>
					<Users />
				</Route>
				<Route path='/new-category' exact>
					<NewCategory />
				</Route>
				<Route path='/new-product' exact>
					<NewProduct />
				</Route>
				<Route exact path='/product/:id'>
					<Product />
				</Route>
				<Route exact path='/cat/:id'>
					<ProductsByCat />
				</Route>
				<Route exact path='/cart'>
					<Cart />
				</Route>
				<Route exact path='/wishlist'>
					<WishListPage />
				</Route>

				<Redirect to='/' />
			</Switch>
		);
	} else {
		routes = (
			<Switch>
				<Route path='/users' exact>
					<Users />
				</Route>
				<Route path='/' exact>
					<Categories />
				</Route>
				<Route path='/new-category' exact>
					<NewCategory />
				</Route>

				<Route exact path='/product/:id'>
					<Product />
				</Route>
				<Route exact path='/cat/:id'>
					<ProductsByCat />
				</Route>
				<Route exact path='/cart'>
					<Cart />
				</Route>
				<Route exact path='/wishlist'>
					<WishListPage />
				</Route>
				<Route path='/auth'>
					<Auth />
				</Route>
				<Redirect to='/auth' />
			</Switch>
		);
	}
	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: !!token,
				token: token,
				userId: userId,
				login: login,
				logout: logout
			}}
		>
			<Router>
				<Route path='/'>
					<MainNavigation />
				</Route>
				<main>{routes}</main>
			</Router>
		</AuthContext.Provider>
	);
}

export default App;
