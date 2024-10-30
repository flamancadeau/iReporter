import Button from "./components/Button";

export default function Register() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="p-8">
          <h2 className="mb-6 text-center text-3xl font-bold">Sign Up</h2>
          <form className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </div>
          </form>
        </div>
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            {/* <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500"> */}
            Sign in
            {/* </Link> */}
          </p>
        </div>
      </div>
    </div>
  );
}
