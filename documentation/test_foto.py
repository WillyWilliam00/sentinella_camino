import subprocess
from mobile_script import invia_foto_n8n

# NOTA: L'URL qui presente è solo un mock-up/placeholder per scopi di documentazione.
# Nella versione reale dello script, l'URL viene salvata e caricata direttamente 
# in locale dallo smartphone (ad esempio tramite file di configurazione o variabili d'ambiente).
N8N_WEBHOOK_URL_FOTO = "url_n8n"
FOTO_FILE_NAME = "sentinella_camino_test.jpg"

def scatta_foto():
    print("Scattando foto...")
    try:
        comando = ["termux-camera-photo", "-c", "4", FOTO_FILE_NAME]
        subprocess.run(comando, check=True)
        print(f"Foto scattata e salvata come {FOTO_FILE_NAME}")
        return True
    except Exception as e:
        print(f"Errore durante lo scattamento della foto: {e}")
        return False


if __name__ == "__main__":
    if scatta_foto():
        invia_foto_n8n(FOTO_FILE_NAME)
        print("Foto inviata con successo a N8N")
    else:
        print("Errore durante lo scattamento della foto")
