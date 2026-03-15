
import api from '../lib/axiosInstance';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';

type FormState = {
	name: string;
	email: string;
	password: string;
};

function validateEmail(email: string) {
	return /^\S+@\S+\.\S+$/.test(email);
}

export default function Registration() {
    const toast=useRef<Toast|null>(null);
	const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });
	const [errors, setErrors] = useState<Partial<FormState>>({});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);


	const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
	const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
	const computeStrength = (pwd: string) => {
		if (!pwd) return 0;
		if (strongRegex.test(pwd)) return 3;
		if (mediumRegex.test(pwd)) return 2;
		return 1;
	};
    
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name as keyof FormState]: value }));
		setErrors(prev => ({ ...prev, [name as keyof FormState]: undefined }));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const newErrors: Partial<FormState> = {};
		if (!form.name.trim()) newErrors.name = 'Name is required';
		if (!form.email) newErrors.email = 'Email is required';
		else if (!validateEmail(form.email)) newErrors.email = 'Invalid email address';
		if (!form.password) newErrors.password = 'Password is required';
		else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

		if (Object.keys(newErrors).length) {
			setErrors(newErrors);
			return;
		}
        api.post("/api/user/register", { name: form.name, email: form.email, password: form.password }, { headers: {
            Accept: "application/json"
        } }).then((response) => {
            console.log(response);
            toast.current?.show({severity:"success",detail:"Registeration Success",summary:"You're Registration was a success\n Please wait for Verification Email"});
        })
        .catch((error)=>{
            console.log(error);
            
            toast.current?.show({severity:"error",detail:"Server Error",summary:"Issues with server"});
            return;
        })
		setLoading(true);
		setMessage(null);
		setTimeout(() => {
			setLoading(false);
			setMessage(`Account created for ${form.email}`);
			setForm({ name: '', email: '', password: '' });
		}, 900);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-[#f4f6fb] p-7">
            <Toast ref={toast}/>
			<form
				className="min-w-[40vh] lg:min-w-[60vh] p-6 rounded-lg bg-white shadow-lg"
				onSubmit={handleSubmit}
				aria-label="registration-form"
			>
				<h2 className="text-xl font-semibold text-slate-900 mb-3">Create an account</h2>

				<label className="block text-sm text-slate-700 mt-3" htmlFor="name">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					autoComplete="name"
					value={form.name}
					onChange={handleChange}
					className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
					placeholder="Your full name"
			
				/>

				{errors.name && <div className="text-red-600 text-xs mt-2">{errors.name}</div>}

				<label className="block text-sm text-slate-700 mt-3" htmlFor="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					value={form.email}
					onChange={handleChange}
					className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
					placeholder="you@example.com"
				
				/>
				{errors.email && <div className="text-red-600 text-xs mt-2">{errors.email}</div>}

				<label className="block text-sm text-slate-700 mt-3" htmlFor="password">Password</label>
				<div className="relative">
					{/* <input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						autoComplete="new-password"
						value={form.password}
						onChange={handleChange}
						className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 pr-20"
						placeholder="At least 6 characters"
				
					/> */}
					{/* <button
						type="button"
						onClick={() => setShowPassword(s => !s)}
						className="absolute right-2 top-2 px-3 py-1 text-sm rounded-md text-slate-700 bg-transparent hover:bg-slate-100"
					>
						{showPassword ? 'Hide' : 'Show'}
					</button> */}
					
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
									<div className="w-full text-gray-900 bg-gray-200  dark:text-white p-6">
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

				</div>
				{errors.password && <div className="text-red-600 text-xs mt-2">{errors.password}</div>}

				<button
					type="submit"
					className="w-full mt-4 py-2.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
					aria-busy={loading}
				>
					{loading ? 'Creating...' : 'Create account'}
				</button>

				{message ? (
					<div className="text-sm text-green-600 mt-3 text-center">{message}</div>
				) : (
					<div className="text-sm text-slate-600 mt-3 text-center">Use a valid email and a password (min 6 chars)</div>
				)}

				<div className="text-sm text-slate-600 mt-4 text-center">
					Already have an account? <a href="/login" className="text-indigo-600 font-medium">Log in</a>
				</div>
			</form>
		</div>
	);
}

