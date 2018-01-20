import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Card, {CardActions, CardContent} from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import React, { Component } from 'react';
import Reboot from 'material-ui/Reboot';
import Snackbar from 'material-ui/Snackbar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { CircularProgress } from 'material-ui/Progress';


class App extends Component {
  state = {
    snackbar: {
      open: false,
      message: ''
    }
  };

  componentDidMount() {
    this.setState({ loading: true, authenticated: null })
    this.fetchAuth()
      .then(res => this.setState({ authenticated: res.authenticated, loading: false }))
      .catch(error => console.log(error));
  }

  fetchAuth = async () => {
    const response = await fetch('/api/auth');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.error);

    return body;
  };

  linkBridgeButtonPressed = () => {
    this.linkBridge()
      .then(res => {
        this.setState({ authenticated: true })
      })
      .catch(error => {
        this.setState({ snackbar: { open: true, message: error.message } })
      });
  }

  linkBridge = async () => {
    const response = await fetch('/api/auth', { method: 'POST' });
    const body = await response.json();

    if (response.status !== 200) throw Error(body.error);

    return body;
    // this.fetchAuth()
    //   .then(res => this.setState({ authenticated: res.authenticated }))
    //   .catch(error => console.log(error));
  };

  handleSnackbarClose = () => {
    this.setState({ snackbar: { open: false } })
  }

  renderLoading() {
    return (
      <CircularProgress />
      )
  }

  renderRegisterCard() {
    return (
      <Grid item sm={8} xs={12}>
        <Card>
          <CardContent>
            <Typography component='p'>
              No bridge is linked. Link one by pressing the button on the bridge then click on "Link bridge"
            </Typography>
          </CardContent>
          <CardActions>
            <Button raised color='primary' onClick={this.linkBridgeButtonPressed}>
              Link bridge
            </Button>
          </CardActions>
        </Card>
      </Grid>
      )
  }

  render() {
    return (
      <div>
        <Reboot />
        <AppBar position='fixed'>
          <Toolbar>
            <Typography type='title' color='inherit'>
              Hue Home Controller
            </Typography>
          </Toolbar>
        </AppBar>
        <Grid container justify='center'>
          { this.state.loading ? this.renderLoading() : null }
          { !this.state.loading && this.state.authenticated === false ? this.renderRegisterCard() : null }
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.snackbar.open}
          onClose={this.handleSnackbarClose}
          message={this.state.snackbar.message}
        />
      </div>
    )
  }
}

export default App;
