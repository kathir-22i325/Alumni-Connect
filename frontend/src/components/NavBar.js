import { useState } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { AccountCircle, Menu as MenuIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; 

const Navbar = () => {
  const token = localStorage.getItem("token");
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  let userName = "User";
  let role = "";

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userName = decodedToken.name || "User";
      role = decodedToken.role || "";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload(); 
  };

  const navLinks = [
    { text: "Home", path: "/" },
    { text: "Gallery", path: "/gallery" },
    { text: "Events", path: "/events" },
    { text: "Search Alumni", path: "/search-alumni" },
    { text: "Mentorship", path: "/mentorship" },
    { text: "Contact Us", path: "/contact-us" },
    
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ background: "linear-gradient(to right, #4a00e0, #8e2de2)", zIndex: 1100 }}>
        <Toolbar>
          {/* Mobile Menu Icon */}
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ display: { xs: "block", md: "none" } }}>
            <MenuIcon />
          </IconButton>

          {/* Title */}
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: { xs: "center", md: "left" } }}>
            PSG Tech Alumni Association
          </Typography>

          {/* Desktop Menu */}
          <div sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => (
              <Button key={link.text} color="inherit" component={Link} to={link.path} sx={{ display: { xs: "none", md: "inline-flex" } }}>
                {link.text}
              </Button>
            ))}

              {role === "Admin" && (
              <Button
                color="inherit"
                component={Link}
                to="/admin-home"
                sx={{ display: { xs: "none", md: "inline-flex" } }}
              >
                Dashboard
              </Button>
            )}

            {!token && <Button color="inherit" component={Link} to="/login">Login</Button>}

            {token && (
              <>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <AccountCircle />
                  <Typography variant="body1" sx={{ ml: 1 }}>{userName}</Typography>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  {role === "Alumni" && (
                    <>
                      <MenuItem component={Link} to="/view-profile" onClick={handleMenuClose}>View Profile</MenuItem>
                      <MenuItem component={Link} to="/update-profile" onClick={handleMenuClose}>Update Profile</MenuItem>
                    </>
                  )}
                  <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        <List sx={{ width: 250 }}>
          {navLinks.map((link) => (
            <ListItem button key={link.text} component={Link} to={link.path} onClick={handleDrawerToggle}>
              <ListItemText primary={link.text} />
            </ListItem>
          ))}
          {!token && (
            <ListItem button component={Link} to="/login" onClick={handleDrawerToggle}>
              <ListItemText primary="Login" />
            </ListItem>
          )}
          {token && (
            <>
              {role === "Alumni" && (
                <>
                  <ListItem button component={Link} to="/view-profile" onClick={handleDrawerToggle}>
                    <ListItemText primary="View Profile" />
                  </ListItem>
                  <ListItem button component={Link} to="/update-profile" onClick={handleDrawerToggle}>
                    <ListItemText primary="Update Profile" />
                  </ListItem>
                </>
              )}
              <ListItem button onClick={() => { handleDrawerToggle(); handleLogout(); }}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
