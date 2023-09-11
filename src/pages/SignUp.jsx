import { useForm } from "react-hook-form";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    axios
      .post("http://localhost:3000/signup", data)
      .then((response) => {
        console.log(response.data);
        navigate("/signin");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        className="bg-white p-8 rounded shadow-md w-96"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <div className="mb-4">
          <label htmlFor="username" className="block font-semibold mb-1">
            Username
          </label>
          <input
            {...register("username", { required: true })}
            type="text"
            className="w-full border p-2 rounded "
          />
          {errors.username && (
            <p className="text-red-500 mt-1">Username is required</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block font-semibold mb-1">
            Email
          </label>
          <input
            {...register("email", { required: true })}
            type="email"
            className="w-full border p-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 mt-1">Email is required</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block font-semibold mb-1">
            Password
          </label>
          <input
            {...register("password", { required: true })}
            type="password"
            className="w-full border p-2 rounded"
          />
          {errors.password && (
            <p className="text-red-500 mt-1">Password is required</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Role</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register("role", { required: true })}
                value="user"
                className="form-radio"
              />
              <span>User</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register("role", { required: true })}
                value="mentor"
                className="form-radio"
              />
              <span>Mentor</span>
            </label>
          </div>
          {errors.role && <p className="text-red-500 mt-1">Role is required</p>}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>
        <Link
          className="ms-4 underline duration-300  px-4 py-2 rounded hover:bg-blue-500 hover:text-white"
          to="/signin"
        >
          Sign In
        </Link>
      </form>
    </div>
  );
};

export default SignUp;
