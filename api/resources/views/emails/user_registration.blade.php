<!DOCTYPE html>
<html>
<head>
    <title>Bienvenue sur MindCare</title>
</head>
<body>
    <img src="{{ $logoUrl }}" alt="MindCare Logo">
    <h1>Bienvenue {{ $firstName }} {{ $lastName }}</h1>
    <p>Merci de confirmer votre email en cliquant sur le lien ci-dessous :</p>
    <a href="{{ $validationUrl }}">Vérifier mon email</a>
    <p>Ce lien expire le {{ $expirationDate }}</p>
</body>
</html>