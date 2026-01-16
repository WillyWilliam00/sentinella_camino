
"""
Script Python per dispositivi mobili
Questo script è indipendente dal progetto Next.js
"""

import datetime
import subprocess
import time
import requests
import json
import threading

# URL del webhook N8N
# NOTA: Le URL qui presenti sono solo mock-up/placeholder per scopi di documentazione.
# Nella versione reale dello script, le URL vengono salvate e caricate direttamente 
# in locale dallo smartphone (ad esempio tramite file di configurazione o variabili d'ambiente).
N8N_WEBHOOK_URL_FOTO = "url_n8n"
N8N_WEBHOOK_URL_INFO_TELEFONO = "url_n8n"
# Intervallo di tempo in secondi tra le richieste 30minuti
INTERVALLO_TEMPO_FOTO = 1800
INTERVALLO_TEMPO_INFO_TELEFONO = 60
# nome  del file foto 
FOTO_FILE_NAME = "sentinella_camino.jpg"

def scatta_foto():
    print("Scattando foto...")
    # comando per scattare foto con termux, c sta per CAMERA, 0 sta per il numero della camera, FOTO_FILE_NAME sta per il nome del file foto
    comando = ["termux-camera-photo", "-c", "4", FOTO_FILE_NAME]
    try:
        subprocess.run(comando, check=True)
        print(f"Foto scattata e salvata come {FOTO_FILE_NAME}")
        return True
    except Exception as e:
        print(f"Errore durante lo scattamento della foto: {e}")
        return False

def info_telefono():
    print("Leggendo info telefono...")
    comandi = ["termux-battery-status", "termux-wifi-connectioninfo"]
    try: 
        check_batteria = json.loads(subprocess.check_output(comandi[0]))
        check_connessione = json.loads(subprocess.check_output(comandi[1]))
        percentuale = check_batteria["percentage"]
        stato = check_batteria["status"]
        temperatura_batteria = check_batteria["temperature"]
        rssi = check_connessione["rssi"]
        link_speed_mbps = check_connessione["link_speed_mbps"]

        return {
            "stato": stato, 
            "percentuale": percentuale,
            "temperatura_batteria": temperatura_batteria,
            "rssi": rssi,
            "link_speed_mbps": link_speed_mbps
        }
    except Exception as e:
        print(f"Errore durante la lettura dell'info telefono: {e}")
        return None
    
    


def invia_foto_n8n(file_name):
    print("Inviando foto a N8N...")
    try:
        with open(file_name, "rb") as foto:
          
            files = {
                'data': (file_name, foto, 'image/jpeg')
            }
            headers = {
                "X-Sentinella-Type" : "test" if "test" in file_name else "foto"
            }
            risposta = requests.post(N8N_WEBHOOK_URL_FOTO, files=files, headers=headers)
            if risposta.status_code == 200:
                print("Foto inviata con successo a N8N")
                return True, risposta.text
            else:
                print(f"Errore durante l'invio della foto: {risposta.status_code}")
                return False, risposta.text
    except Exception as e:
        print(f"Errore durante l'invio della foto: {e}")
        return False

def invia_info_telefono_n8n():
    print("Inviando info telefono a N8N...")
    try:
        risultato = info_telefono()
        date = datetime.datetime.now().strftime("%H:%M:%S")
        data_da_inviare = { **risultato, "ultimo_update": date }
        requests.post(N8N_WEBHOOK_URL_INFO_TELEFONO, json=data_da_inviare)
    except Exception as e:
        print(f"Errore durante l'invio della percentuale: {e}")
        return False



def ciclo_foto():
    while True:
        if scatta_foto():
            invia_foto_n8n(FOTO_FILE_NAME)
            print(f"Foto inviata con successo a N8N, attendi {INTERVALLO_TEMPO_FOTO} secondi prima della prossima foto...")
            time.sleep(INTERVALLO_TEMPO_FOTO)
def ciclo_info_telefono():
    while True:
        invia_info_telefono_n8n()
        print(f"Info telefono inviata con successo a N8N, attendi {INTERVALLO_TEMPO_INFO_TELEFONO} secondi prima della prossima lettura dell'info telefono...")
        time.sleep(INTERVALLO_TEMPO_INFO_TELEFONO)




if __name__ == "__main__":
    t1 = threading.Thread(target=ciclo_foto, daemon=True)
    t2 = threading.Thread(target=ciclo_info_telefono, daemon=True)
    try: 
        print("Inizio ciclo foto, percentuale e WiFi...")
        t1.start()
        t2.start()
        while t1.is_alive() or t2.is_alive():
            time.sleep(1)
    except Exception as e:
        print(f"Errore durante il ciclo foto, info telefono: {e}")
    finally:
        print("Ciclo foto, info telefono terminato...")
        
