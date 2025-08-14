# start.jl

using Genie

# Optional: Setze Umgebungsvariablen
ENV["GENIE_ENV"] = "dev"  # oder "prod"

# Pfad zum Projekt (anpassen, falls nötig)
Genie.config.run_as_server = true
Genie.config.server_host = "127.0.0.1"
Genie.config.server_port = 8000
Genie.config.websockets_server = true # enable the websockets server

# Lade die App
Genie.loadapp()

# Starte den Webserver
Genie.up()