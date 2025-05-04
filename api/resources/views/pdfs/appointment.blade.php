<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rendez-vous médical</title>
    <style>
        :root {
            --primary-color: #4a90e2;
            --secondary-color: #5c6bc0;
            --text-color: #333;
            --light-color: #f5f5f5;
            --border-color: #e0e0e0;
        }
        
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: var(--text-color);
            line-height: 1.6;
            padding: 0;
            margin: 0;
            background-color: white;
        }
        
        .container {
            padding: 30px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--primary-color);
        }
        
        .header h1 {
            color: var(--primary-color);
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        
        .header p {
            color: #666;
            margin-top: 5px;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 30px;
            background-color: var(--light-color);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .section-title {
            color: var(--secondary-color);
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
            font-size: 18px;
        }
        
        .info-row {
            margin-bottom: 12px;
            display: flex;
        }
        
        .label {
            font-weight: 600;
            width: 150px;
            color: #555;
        }
        
        .value {
            flex: 1;
        }
        
        .status {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            text-transform: capitalize;
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        
        .status.pending {
            background-color: #fff8e1;
            color: #f57c00;
        }
        
        .status.canceled {
            background-color: #ffebee;
            color: #c62828;
        }
        
        .status.confirmed {
            background-color: #e3f2fd;
            color: #1565c0;
        }
        
        .notes, .prescription {
            background-color: white;
            border-radius: 6px;
            border-left: 4px solid var(--secondary-color);
            padding: 15px;
            margin-top: 10px;
            white-space: pre-line;
        }
        
        .prescription {
            border-left-color: #66bb6a;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Récapitulatif de rendez-vous</h1>
            <p>MindCare - Votre santé, notre priorité</p>
        </div>

        <div class="section">
            <h2 class="section-title">Informations générales</h2>
            <div class="info-row">
                <div class="label">Date et heure :</div>
                <div class="value">{{ $appointment->start_time->format('d/m/Y H:i') }} - {{ $appointment->end_time->format('H:i') }}</div>
            </div>
            <div class="info-row">
                <div class="label">Statut :</div>
                <div class="value">
                    <span class="status {{ $appointment->status }}">{{ ucfirst($appointment->status) }}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Patient</h2>
            @if(isset($appointment->patient) && isset($appointment->patient->user))
            <div class="info-row">
                <div class="label">Nom :</div>
                <div class="value">{{ $appointment->patient->user->firstname }} {{ $appointment->patient->user->lastname }}</div>
            </div>
            <div class="info-row">
                <div class="label">Email :</div>
                <div class="value">{{ $appointment->patient->user->email }}</div>
            </div>
            <div class="info-row">
                <div class="label">Téléphone :</div>
                <div class="value">
                    @if(isset($appointment->patient->user->decrypted_phone))
                        {{ $appointment->patient->user->decrypted_phone }}
                    @else
                        Information confidentielle
                    @endif
                </div>
            </div>
            @else
            <div class="info-row">
                <span>Informations patient non disponibles</span>
            </div>
            @endif
        </div>

        <div class="section">
            <h2 class="section-title">Professionnel</h2>
            @if(isset($appointment->professional) && isset($appointment->professional->user))
            <div class="info-row">
                <div class="label">Nom :</div>
                <div class="value">{{ $appointment->professional->user->firstname }} {{ $appointment->professional->user->lastname }}</div>
            </div>
            <div class="info-row">
                <div class="label">Email :</div>
                <div class="value">{{ $appointment->professional->user->email }}</div>
            </div>
            <div class="info-row">
                <div class="label">Téléphone :</div>
                <div class="value">
                    @if(isset($appointment->professional->user->decrypted_phone))
                        {{ $appointment->professional->user->decrypted_phone }}
                    @else
                        Information confidentielle
                    @endif
                </div>
            </div>
            @else
            <div class="info-row">
                <span>Informations professionnel non disponibles</span>
            </div>
            @endif
        </div>

        @if($appointment->notes)
        <div class="section">
            <h2 class="section-title">Notes de consultation</h2>
            <div class="notes">{{ $appointment->notes }}</div>
        </div>
        @endif

        @if($appointment->prescription)
        <div class="section">
            <h2 class="section-title">Prescription</h2>
            <div class="prescription">{{ $appointment->prescription }}</div>
        </div>
        @endif

        <div class="footer">
            <p>Document généré le {{ now()->format('d/m/Y à H:i') }} | MindCare © {{ now()->format('Y') }}</p>
        </div>
    </div>
</body>
</html>