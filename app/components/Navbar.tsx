import { Link } from "react-router";

const Navbar = () => {
	return (
		<nav className="navbar" aria-label="Primary navigation">
			<Link to="/" aria-label="Resumind homepage">
				<p className="text-gradient text-lg font-bold sm:text-xl">RESUMIND</p>
			</Link>
			<Link to="/upload" className="primary-button w-fit">
				Upload Resume
			</Link>
		</nav>
	);
};

export default Navbar;
