<!DOCTYPE html>
<html>
<head>
    <title>Notification de changement de mot de passe - MindCare</title>
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
        .warning {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
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
            <p>Nous vous informons que votre mot de passe MindCare a été modifié le {{ $changeDate }}.</p>
            
            <div class="warning">
                <strong>Vous n'êtes pas à l'origine de cette action?</strong>
                <p>Si vous n'avez pas modifié votre mot de passe, veuillez contacter immédiatement notre équipe de support à l'adresse suivante: <a href="mailto:support@mindcare.fr">support@mindcare.fr</a>.</p>
            </div>
            
            <p>Pour votre sécurité, nous vous recommandons de:</p>
            <ul>
                <li>Vous connecter à votre compte et vérifier vos informations personnelles</li>
                <li>Modifier à nouveau votre mot de passe si nécessaire</li>
                <li>Vérifier que vous êtes bien déconnecté de tous les appareils que vous n'utilisez plus</li>
            </ul>
            
            <p>Cordialement,<br>L'équipe MindCare</p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>&copy; {{ date('Y') }} MindCare. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>