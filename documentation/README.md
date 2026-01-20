# Script Python Mobile

Questa cartella contiene gli script Python che vengono eseguiti sul dispositivo mobile Android per il monitoraggio del camino.

## ⚠️ Note Importanti

- **Questi script sono inclusi nel repository solo per completezza del progetto**
- **Le URL dei webhook presenti negli script sono esempi/placeholder**
- Nella versione reale, le URL vengono salvate e caricate direttamente in locale dallo smartphone (ad esempio tramite file di configurazione o variabili d'ambiente)
- Gli script sono indipendenti dal progetto Electron e possono essere installati direttamente su un dispositivo mobile con Python e Termux

## 📱 Prerequisiti

- Dispositivo Android con [Termux](https://termux.com/) installato
- Python 3 installato in Termux
- Connessione SSH configurata sul dispositivo
- Accesso alla camera del dispositivo

## 📦 Installazione Dipendenze

Prima di eseguire gli script, installa le dipendenze necessarie:

```bash
pip install -r requirements.txt
```

Oppure installa direttamente:

```bash
pip install requests
```

## 📄 Script Disponibili

### `mobile_script.py` - Script Principale

Script principale che viene eseguito continuamente sul dispositivo mobile per monitorare il camino.

#### Funzionalità

1. **Scatto Foto Periodico**
   - Scatta una foto del camino ogni **30 minuti** (1800 secondi)
   - Utilizza Termux Camera API (`termux-camera-photo`)
   - Salva la foto come `sentinella_camino.jpg`

2. **Monitoraggio Dispositivo**
   - Legge informazioni del dispositivo ogni **60 secondi**
   - Raccoglie dati su:
     - Percentuale batteria
     - Stato carica (CHARGING/DISCHARGING)
     - Temperatura batteria
     - Segnale WiFi (RSSI)
     - Velocità connessione WiFi (Mbps)

3. **Invio Dati a N8N**
   - Invia foto al webhook N8N per l'analisi AI
   - Invia informazioni del dispositivo al webhook N8N
   - Gestisce errori e retry automatici

#### Funzioni Principali

- `scatta_foto()`: Scatta una foto utilizzando Termux Camera API
- `info_telefono()`: Legge informazioni del dispositivo (batteria, WiFi) tramite Termux API
- `invia_foto_n8n(file_name)`: Invia la foto al webhook N8N con header personalizzato
- `invia_info_telefono_n8n()`: Invia le informazioni del dispositivo al webhook N8N
- `ciclo_foto()`: Loop principale per lo scatto periodico delle foto
- `ciclo_info_telefono()`: Loop principale per l'invio periodico delle informazioni

#### Configurazione

```python
# Intervalli di tempo (in secondi)
INTERVALLO_TEMPO_FOTO = 1800  # 30 minuti
INTERVALLO_TEMPO_INFO_TELEFONO = 60  # 1 minuto

# Nome file foto
FOTO_FILE_NAME = "sentinella_camino.jpg"

# URL webhook N8N (ESEMPI - da configurare localmente)
N8N_WEBHOOK_URL_FOTO = "url_n8n"
N8N_WEBHOOK_URL_INFO_TELEFONO = "url_n8n"
```

#### Esecuzione

Lo script viene avviato tramite SSH dall'applicazione Electron con il comando:
```bash
termux-wake-lock && python ~/mobile_script.py
```

Il `termux-wake-lock` mantiene il dispositivo sveglio durante l'esecuzione.

### `test_foto.py` - Script di Test

Script per testare manualmente lo scatto di una foto.

#### Funzionalità

- Scatta una singola foto di test
- Invia la foto al webhook N8N con header `X-Sentinella-Type: test`
- Utile per verificare la configurazione senza attendere il ciclo automatico

#### Funzioni

- `scatta_foto()`: Scatta una foto utilizzando Termux Camera API
- Utilizza `invia_foto_n8n()` da `mobile_script.py` per l'invio

#### Esecuzione

Lo script viene eseguito tramite SSH dall'applicazione Electron con il comando:
```bash
python ~/test_foto.py
```

## 🔧 Utilizzo con l'Applicazione Electron

L'applicazione Electron controlla questi script tramite connessioni SSH:

1. **Collegamento Dispositivo**: Avvia `mobile_script.py` in background
2. **Scatto Foto Manuale**: Esegue `test_foto.py` per una foto immediata
3. **Scollegamento Dispositivo**: Termina lo script e sblocca il dispositivo
4. **Verifica Stato**: Controlla se lo script Python è in esecuzione

## 📋 Requisiti Termux

Gli script utilizzano le seguenti API di Termux:

- `termux-camera-photo`: Per scattare foto
- `termux-battery-status`: Per leggere lo stato della batteria
- `termux-wifi-connectioninfo`: Per leggere informazioni WiFi
- `termux-wake-lock`: Per mantenere il dispositivo sveglio
- `termux-wake-unlock`: Per sbloccare il dispositivo

Assicurati di aver concesso i permessi necessari a Termux:
- Accesso alla camera
- Accesso alle informazioni del dispositivo

## 🔐 Sicurezza

- Le credenziali SSH per accedere al dispositivo sono configurate nel file `.env` dell'applicazione Electron
- Le URL dei webhook N8N devono essere configurate localmente sul dispositivo mobile




## 📚 Riferimenti

- [Termux Documentation](https://wiki.termux.com/wiki/Main_Page)
- [Termux API](https://wiki.termux.com/wiki/Termux:API)
- [N8N Webhooks](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
