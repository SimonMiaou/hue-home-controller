import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Card, {CardActions, CardContent} from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import Reboot from 'material-ui/Reboot';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';



class App extends Component {
  state = {
    response: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

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
         <Grid item sm={8} xs={12}>
            <Card>
              <CardContent>
                <Typography component='p'>
                  {this.state.response}
                </Typography>
              </CardContent>
              <CardActions>
                <Button raised color='primary'>
                  Link bridge
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default App;
