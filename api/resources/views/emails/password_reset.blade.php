<!DOCTYPE html>
<html>
<head>
    <title>Réinitialisation de votre mot de passe - MindCare</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        .content {
            padding: 30px 20px;
        }
        h1 {
            color: #3a7bd5;
            font-size: 24px;
            margin-top: 0;
        }
        .button {
            display: inline-block;
            background-color: #3a7bd5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }
        .expiration {
            font-size: 14px;
            color: #777;
            font-style: italic;
            margin-top: 30px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eaeaea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ $logoUrl }}" alt="MindCare Logo" class="logo">
        </div>
        <div class="content">
            <h1>Bonjour {{ $firstName }} {{ $lastName }},</h1>
            <p>Vous avez récemment demandé la réinitialisation de votre mot de passe sur MindCare.</p>
            <p>Pour définir un nouveau mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>
            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller le lien suivant dans votre navigateur :</p>
            <p style="word-break: break-all;">{{ $resetUrl }}</p>
            <p class="expiration">Ce lien est valable jusqu'au {{ $expirationDate }}.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>&copy; {{ date('Y') }} MindCare. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>