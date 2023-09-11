import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "../redux/UserSlice";

const Navbar = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSignOut = () => {
    dispatch(signOut());
    navigate("/");
  };
  return (
    <nav className="flex justify-between py-3 px-8 items-center bg-cyan-800">
      <Link to="/" className="text-3xl text-bold text-white">
        Mentor
      </Link>
      {user || localStorage.getItem("user") ? (
        <div>
          <Link
            to={
              (user?.role || localStorage.getItem("role")) === "mentor"
                ? "/mentorprofile"
                : "/userprofile"
            }
            className="text-2xl text-white"
          >
            {user?.username || localStorage.getItem("user")}
          </Link>
          <button onClick={handleSignOut} className="text-lg ms-4 text-white">
            Sign Out
          </button>
        </div>
      ) : (
        <Link to="/signin" className="text-xl text-white">
          Sign In
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
