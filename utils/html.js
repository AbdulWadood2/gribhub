exports.htmlForOTP = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verification Code</title>
    <style>
        body {
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .email-container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Verification Code</h1>
        
        <p>Dear User,</p>
        
        <p>Your verification code is: <strong style="color: #0077b6;">#code#</strong></p>
        
        <p>Please use this code to complete your verification process.</p>
        
        <p>Thank you for using our service.</p>
    </div>
</body>
</html>
`
exports.adminReplyEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Beautiful Message</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
  }

  .container {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    color: #333;
    text-align: center;
  }

  p {
    font-size: 18px;
    line-height: 1.6;
  }
</style>
</head>
<body>

<div class="container">
  <p style="color:pink;"><strong>Reply from cribhub support:</p>
  <p style="color: #333;">#message#</p>
</div>

</body>
</html>
`;