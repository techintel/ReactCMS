export const MENU_ITEM_HEIGHT = 48;
const DRAWER_WIDTH = 240;

export const drawerStyle = theme => ({
  contentLogged: {
    transition: theme.transitions.create('margin-left', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 9,
    },
  },
  appBarShift: {
    marginLeft: DRAWER_WIDTH,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaper: {
    position: 'fixed',
    width: DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    whiteSpace: 'nowrap',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
});

export const boxCardStyle = theme => ({
  boxCard: {
    margin: theme.spacing.unit,
  },
  boxCardHeader: {
    backgroundColor: theme.palette.primary.dark,
  },
});

export const textFieldButtonStyle = theme => ({
  groupTextField: {
    [theme.breakpoints.up('lg')]: {
      width: '60%',
    },
  },
  groupButton: {
    [theme.breakpoints.up('lg')]: {
      width: '40%',
    },
  },
});

export const textFieldStyle = theme => ({
  textField: {
    padding: theme.spacing.unit,
  },
});
