import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e) => {
		// On successful sign-in (placeholder), redirect to /home
		navigate("/home", { replace: true });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
			<div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
				<h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 block w-full border border-gray-200 rounded px-3 py-2"
							placeholder="you@example.com"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 block w-full border border-gray-200 rounded px-3 py-2"
							placeholder="••••••••"
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
					>
						Sign in
					</button>
				</form>
				<p className="text-sm text-center text-gray-600 mt-4">
					Don't have an account? <Link to="/register" className="text-blue-500">Sign up</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;
