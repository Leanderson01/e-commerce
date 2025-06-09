export function AccountDashboard() {
  return (
    <div className="space-y-4">
      <p className="text-gray-800">
        Hello Giovanna! (not Giovanna?{" "}
        <a href="#" className="text-gray-600 underline hover:text-gray-900">
          Log out
        </a>
        )
      </p>

      <p className="text-gray-800">
        From your account dashboard you can view your{" "}
        <a href="#" className="text-gray-600 underline hover:text-gray-900">
          recent orders
        </a>
        , manage your{" "}
        <a href="#" className="text-gray-600 underline hover:text-gray-900">
          billing addresses
        </a>
        , and edit your{" "}
        <a href="#" className="text-gray-600 underline hover:text-gray-900">
          password and account details
        </a>
        .
      </p>
    </div>
  );
}
