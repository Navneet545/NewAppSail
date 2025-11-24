const urllib = require('urllib');
const axios = require('axios');
const catalyst=require('zcatalyst-sdk-node');

// @GET call for GET third-party API
exports.getCall1 = async (req, res, next) => {
  try {
    const result = await urllib.request('https://jsonplaceholder.typicode.com/posts', {
      method: 'GET',
      dataType: 'json', // optional: automatically parses JSON response
    });

    console.log(result.data); // result.data contains the parsed response
    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling triggered !!', error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
};

// @GET call for POST third-party API
exports.postCall1 = async (req, res, next) => {
  try {
    const result = await urllib.request('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      dataType: 'json', // optional: automatically parses JSON response
      body: JSON.stringify({
      title: 'Navneet',
      body: 'Backend Dev',
      userId: 1000,
  }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',

  },
    });

    console.log(result.data); // result.data contains the parsed response
    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling triggered !!', error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
};

// exports.getCreator=async(req,res,next)=>{
//   var dbapp=catalyst.initialize(req);
//   var connector = dbapp.connection({ConnectorName: {
//     client_id: '{1000.S69M987XZR9377GHPV506FTNDZATBI}',
//     client_secret: '{de7792c98e843d545cc4d541481b657c5d1e2d6194}',
//     auth_url: '{https://accounts.zoho.in/oauth/v2/auth?access_type=offline}',
//     refresh_url: '{https://accounts.zoho.in/oauth/v2/token}',
//     refresh_token: '{https://accounts.zoho.in/oauth/v2/token}',
//     refresh_in: '{3600}'//Configure the OAuth params from the values returned after registering your app and generating authorization code in Zoho API console}})
//   }}).getConnector('{creator_connection}');

//   connector.getAccessToken().then((accessToken) => {
//   const result = urllib.request('https://www.zohoapis.com/creator/v2.1/data/user1_demo86/manan-demo-app/report/All_Demos', {
//       method: 'GET',
//       dataType: 'json', // optional: automatically parses JSON response
    
//       headers: {
//         'Content-type': 'application/json; charset=UTF-8',
//         'Authorization': 'Zoho-oauthtoken '+accessToken
//       },
//     });
//     console.log(result);
//     return res.status(200).json({message:"get fetched",result});
// });
// }

exports.getCreator = async (req, res, next) => {
  try {
    const dbapp = catalyst.initialize(req);

    const connector = dbapp.connection({
      ConnectorName: {
        client_id: '1000.S69M987XZR9377GHPV506FTNDZATBI',
        client_secret: 'de7792c98e843d545cc4d541481b657c5d1e2d6194',
        auth_url: 'https://accounts.zoho.in/oauth/v2/auth?access_type=offline',
        refresh_url: 'https://accounts.zoho.in/oauth/v2/token',
        refresh_token: '1000.xxxxxx.xxxxxx', // actual refresh token
        refresh_in: '3600'
      }
    }).getConnector('creator_connection'); 

    const accessToken = await connector.getAccessToken();

    const result = await urllib.request(
      'https://www.zohoapis.com/creator/v2.1/data/user1_demo86/manan-demo-app/report/All_Demos',
      {
        method: 'GET',
        dataType: 'json',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'Authorization': 'Zoho-oauthtoken ' + accessToken
        },
      }
    );

    console.log(result.data);
    return res.status(200).json({ message: 'Data fetched successfully', result: result.data });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


// GET request in node.js using axios
exports.getCall = async (req, res, next) => {
  try {
    const result= await axios({
    method: 'get',
    url: 'https://jsonplaceholder.typicode.com/posts',
    // responseType: 'stream'
  });
    console.log(result.data); // result.data contains the parsed response
    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling triggered !!', error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
};


// // Send a POST request using axois
// axios({
//   method: 'post',
//   url: '/user/12345',
//   data: {
//     firstName: 'Fred',
//     lastName: 'Flintstone'
//   }
// });
exports.postCall = async (req, res, next) => {
  try {
    const result = await axios({
      method: 'post',
      url: 'https://jsonplaceholder.typicode.com/posts',
      data: {
      title: 'Navneet',
      body: 'Backend Dev',
      userId: 1000,
      },
      headers: {
        'Content-type': 'application/json; charset=UTF-8',

      },
    });
    console.log(result.data); // result.data contains the parsed response
    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling triggered !!', error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
};