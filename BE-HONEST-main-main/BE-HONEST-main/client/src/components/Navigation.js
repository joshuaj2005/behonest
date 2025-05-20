import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, Person as PersonIcon, Chat as ChatIcon, SportsEsports as GamesIcon, Directions as DirectionsIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit'
});

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    { text: 'Games', icon: <GamesIcon />, path: '/games' },
    { text: 'Directions', icon: <DirectionsIcon />, path: '/directions' }
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <StyledLink to={item.path} key={item.text}>
          <ListItem button>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        </StyledLink>
      ))}
    </List>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            BE HONEST
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation; 