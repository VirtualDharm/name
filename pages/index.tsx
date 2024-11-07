import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Text,
  MantineProvider,
  createTheme
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { IconUser, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'Inter, sans-serif',
  components: {
    Button: {
      styles: (theme: any) => ({
        root: {
          height: '36px',
          transition: 'all 0.2s ease',
        }
      })
    },
    TextInput: {
      styles: (theme: any) => ({
        input: {
          height: '36px',
        }
      })
    },
    PasswordInput: {
      styles: (theme: any) => ({
        input: {
          height: '36px',
        }
      })
    }
  }
});

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length > 5) strength += 20;
  if (password.match(/[A-Z]/)) strength += 20;
  if (password.match(/[a-z]/)) strength += 20;
  if (password.match(/[0-9]/)) strength += 20;
  if (password.match(/[@$!%*?&#]/)) strength += 20;
  return strength;
}

function LoginFormContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [joke, setJoke] = useState('Welcome to our app!');

  const validateForm = () => {
    setError(false);
    setMessage('');

    if (username.includes(' ') || username.length < 3) {
      setMessage('Username must be at least 3 characters and contain no spaces.');
      setError(true);
      return false;
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      setError(true);
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    setLoading(false);
    if (data) {
      setMessage('Login successful!');
      setError(false);
      setIsLoggedIn(true);
    } else {
      setMessage('Login failed. Please check your credentials.');
      setError(true);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      setLoading(false);
      setMessage('Username already exists. Please choose another.');
      setError(true);
      return;
    }

    // If user doesn't exist, create new account
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{ username, password }]);

    setLoading(false);

    if (insertError) {
      setMessage('Registration failed. Please try again.');
      setError(true);
    } else {
      setMessage('Account created successfully! You can now sign in.');
      setError(false);
      // Reset form and switch to login view after short delay
      setTimeout(() => {
        setIsRegister(false);
        setUsername('');
        setPassword('');
        setMessage('');
      }, 2000);
    }
  };

  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setMessage('');
    setIsLoggedIn(false);
  };

  const VisibilityToggle = ({
    reveal,
    onClick
  }: {
    reveal?: boolean;
    onClick?(): void;
  }) => (
    <button
      type="button"
      className="p-2 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
      onClick={onClick}
      tabIndex={-1}
    >
      {reveal ? (
        <IconEyeOff size={16} className="text-gray-400" />
      ) : (
        <IconEye size={16} className="text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-6">
      <Paper className="w-full max-w-[400px] bg-white p-8" radius="sm" shadow="sm">
        {!isLoggedIn ? (
          <>
            {/* Login/Register Form */}
            <div className="text-center mb-6">
              <Text className="text-2xl font-medium text-violet-500 mb-1">
                {isRegister ? 'Create Account' : 'Sign In'}
              </Text>
              <Text size="sm" className="text-gray-500">
                {isRegister 
                  ? 'Create your account to get started' 
                  : 'Welcome back! Please enter your details'}
              </Text>
            </div>

            <div className="space-y-4">
              {/* Username input */}
              <div>
                <Text className="text-sm text-gray-600 mb-1">Username</Text>
                <TextInput
                  placeholder="johnmark"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  classNames={{
                    input: 'border border-gray-200 pl-0',
                    wrapper: 'h-10',
                    root: 'relative'
                  }}
                  rightSection={<IconUser size={16} className="text-gray-400 absolute right-3" />}
                  error={error && message.includes('Username')}
                  size="sm"
                />
              </div>

              {/* Password input */}
              <div>
                <Text className="text-sm text-gray-600 mb-1">Password</Text>
                <PasswordInput
                  placeholder="Password@123"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.currentTarget.value);
                    setError(false);
                    setMessage('');
                  }}
                  classNames={{
                    input: 'border border-gray-200 pl-0',
                    wrapper: 'h-10',
                    innerInput: 'bg-transparent',
                    visibilityToggle: 'absolute right-3 hover:bg-transparent focus:outline-none'
                  }}
                  rightSection={
                    <div className="absolute right-3">
                      <IconEye size={16} className="text-gray-400" />
                    </div>
                  }
                  error={error && message.includes('Password')}
                  size="sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  fullWidth
                  className="bg-violet-500 hover:bg-violet-600 text-white h-9"
                  onClick={() => validateForm() && (isRegister ? handleRegister() : handleLogin())}
                  loading={loading}
                >
                  {isRegister ? 'Create Account' : 'Sign In'}
                </Button>
                <Button
                  variant="default"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 h-9"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? 'Sign In' : 'Create Account'}
                </Button>
              </div>

              {/* Show success/error messages */}
              {message && (
                <Text 
                  size="sm" 
                  className={`mt-2 ${error ? 'text-red-500' : 'text-green-500'}`}
                >
                  {message}
                </Text>
              )}
            </div>
          </>
        ) : (
          // Logged in state
          <div className="text-center">
            <Text className="text-2xl font-medium text-violet-500 mb-2">
              Welcome Back, {username}!
            </Text>
            <Text size="sm" className="text-gray-500 mb-2">
              Password Strength: {getPasswordStrength(password)}%
            </Text>
            <Text size="sm" className="text-gray-600 mb-4 italic">
              "{joke}"
            </Text>
            <Button
              fullWidth
              className="bg-violet-500 hover:bg-violet-600 text-white h-9"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        )}
      </Paper>
    </div>
  );
}

const LoginForm = dynamic(() => Promise.resolve(LoginFormContent), {
  ssr: false
});

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <LoginForm />
    </MantineProvider>
  );
}
