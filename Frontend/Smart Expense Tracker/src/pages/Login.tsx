
import api from '../lib/axiosInstance';
import authService from '../lib/authService';
import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
type FormState = {
	email: string;
	password: string;
};


export default function Login() {
	function validateEmail(email: string) {
		return /^\S+@\S+\.\S+$/.test(email);
	}
	const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
	const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
	const computeStrength = (pwd: string) => {
		if (!pwd) return 0;
		if (strongRegex.test(pwd)) return 3;
		if (mediumRegex.test(pwd)) return 2;
		return 1;
	};
	const [form, setForm] = useState<FormState>({ email: '', password: '' });
	const [errors, setErrors] = useState<Partial<FormState>>({});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const toast = useRef<Toast | null>(null);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name as keyof FormState]: value }));
		setErrors(prev => ({ ...prev, [name as keyof FormState]: undefined }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const newErrors: Partial<FormState> = {};
		if (!form.email) newErrors.email = 'Email is required';
		else if (!validateEmail(form.email)) newErrors.email = 'Invalid email address';
		if (!form.password) newErrors.password = 'Password is required';
		else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

		if (Object.keys(newErrors).length) {
			setErrors(newErrors);
			return;
		}
		setLoading(true);

		await api.post("/api/user/", { email: form.email, password: form.password }, {
			headers: {
				"Accept": "application/JSON",
			}
		}).then((response: any) => {
			console.log("🔐 Login Response:", response);

			if (response.status == 200) {
				console.log("📦 Response Data:", response.data);
				console.log("📦 Response Data.data:", response.data.data);
				
				const { user, accessToken, refreshToken } = response.data.data;
				
				console.log("👤 User:", user);
				console.log("🔑 AccessToken:", accessToken ? "EXISTS ✓" : "MISSING ✗");
				console.log("🔄 RefreshToken:", refreshToken ? "EXISTS ✓" : "MISSING ✗");
				console.log("   (For cross-domain deployments like Vercel + Render)");
				
				// if (!user.isVerified) {
				// 	console.log("Verification Pending");
				// 	toast.current?.show({ severity: "info", summary: "Pending Verification", detail: "You're Verification is pending please Complete" });
				// 	setMessage(`Please Verify you're email to continue`);
				// 	return;
				// }
				
				console.log("💾 Storing user data via authService.setUser()...");
				authService.setUser(user, accessToken, refreshToken);
				console.log("✅ Stored! Checking localStorage...");
				console.log("📍 localStorage.accessToken:", localStorage.getItem("accessToken") ? "EXISTS ✓" : "MISSING ✗");
				console.log("📍 localStorage.refreshToken:", localStorage.getItem("refreshToken") ? "EXISTS ✓" : "MISSING ✗");
				console.log("📍 localStorage.user:", localStorage.getItem("user") ? "EXISTS ✓" : "MISSING ✗");
				
			
				sessionStorage.setItem("jwtToken", accessToken);
				sessionStorage.setItem("id", user._id);
				sessionStorage.setItem("name", user.name);
				sessionStorage.setItem("email", user.email);
				
				toast.current?.show({ severity: "success", summary: "Login Success", detail: "Welcome "+user.name });
				setTimeout(()=>{
					window.location.href="/";
				},3000);
			
				setMessage(`Logged in as ${form.email}`);
			}
		}).catch((error)=>{
			if(error)
			{
				console.error(error);
				toast.current?.show({severity:"error",summary:"Login Failed",detail:"Sorry seems like there is a issue at our side"});
			}
		})
		setMessage(null);
		setTimeout(() => {
			setLoading(false);
			
		}, 1000);
	};

	return (
		<div className="flex items-center justify-center min-h-screen dark:bg-black bg-[#f4f6fb] min-w-full">
			<Toast ref={toast} />
			<form className="min-w-auto lg:min-w-[60vh] p-6 rounded-lg bg-white dark:bg-black dark:border dark:border-white shadow-lg" onSubmit={handleSubmit} aria-label="login-form">
				<h2 className="text-xl font-semibold text-slate-900 mb-3 dark:text-white">Login</h2>

				<label className="block text-sm  dark:text-white text-slate-700 mt-3" htmlFor="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="username"
					value={form.email}
					onChange={handleChange}
					className="w-full px-3 py-2.5 mt-1 rounded-md border dark:text-white  border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
					placeholder="you@example.com"
					aria-invalid={!!errors.email}
				/>
				{errors.email && <div className="text-red-600 text-xs mt-2">{errors.email}</div>}

				<label className="block text-sm text-slate-700 mt-3  dark:text-white" htmlFor="password">Password</label>
				{/* <input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					value={form.password}
					onChange={handleChange}
					className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
					placeholder="Enter your password"
					aria-invalid={!!errors.password}
				/> */}
				<Password
											toggleMask
											id="password"
											name="password"
											type="password"
											inputClassName="w-full px-3 py-2.5 mt-1 rounded-md focus:outline-none focus:ring-indigo-200"
											autoComplete="current-password"
											value={form.password}
											onChange={handleChange}
											feedback={true}
											className="w-full px-3 py-2.5 mt-1 rounded-md border dark:text-white border-gray-200 focus:outline-none focus:ring-indigo-200"
											placeholder="Enter your password"
											panelClassName='bg-white dark:bg-gray-900 p-3 rounded-md shadow-lg w-80'
											panelStyle={{ minWidth: '16rem' }}
											unstyled={true}
											content={() => {
												const pwd = form.password || '';
												const strength = computeStrength(pwd);
												const label =
													strength === 0 ? 'Enter a password' : strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : 'Strong';
												return (
													<div className="w-full text-gray-900 bg-gray-200 rounded-2xl dark:bg-indigo-900  dark:text-white p-6 transition-all">
														<div className="text-sm font-medium mb-2">Password strength</div>
														<div className="flex gap-2 mb-2">
															<div className={`h-2 flex-1 rounded ${strength >= 1 ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
															<div className={`h-2 flex-1 rounded ${strength >= 2 ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
															<div className={`h-2 flex-1 rounded ${strength >= 3 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
														</div>
														<div className="text-xs text-gray-600 dark:text-gray-300">
															{label === 'Weak'
																? 'Weak — consider adding numbers and uppercase letters'
																: label === 'Medium'
																? 'Medium — add length and special characters for a stronger password'
																: label === 'Strong'
																? 'Strong — good job!'
																: 'Enter a password'}
														</div>
													</div>
												);
											}}
										/>
			

				{errors.password && <div className="text-red-600 text-xs mt-2">{errors.password}</div>}

				<button
					type="submit"
					className="w-full mt-4 py-2.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
					aria-busy={loading}
				>
					{loading ? 'Logging in...' : 'Log in'}
				</button>

				{message ? (
					<div className="text-sm text-green-600 mt-3 text-center">{message}</div>
				) : (
					<div className="text-sm text-slate-600 mt-3 text-center dark:text-white">Use a valid email and a password (min 6 chars)</div>
				)}
				
				<div className="text-sm text-slate-600 dark:text-white mt-4 text-center">
					Are you a new User? <a href="/Register" className="text-indigo-600 font-medium">Register</a>
				</div>
			</form>
			
		</div>
	);
}
