#!/bin/bash

# Verifica se existe o terminal tmux
if ! command -v tmux &> /dev/null; then
    echo "Este script usa tmux para executar ambos os serviços, mas o tmux não está instalado."
    echo "Execute 'apt-get install tmux' para instalar, ou execute os scripts separadamente:"
    echo "- ./run-backend.sh em um terminal"
    echo "- ./run-frontend.sh em outro terminal"
    exit 1
fi

# Inicia uma nova sessão tmux
tmux new-session -d -s qg-furioso

# Divide a janela horizontalmente
tmux split-window -h -t qg-furioso

# No painel esquerdo, executa o backend
tmux send-keys -t qg-furioso:0.0 './run-backend.sh' C-m

# No painel direito, executa o frontend
tmux send-keys -t qg-furioso:0.1 './run-frontend.sh' C-m

# Anexa à sessão tmux
tmux attach-session -t qg-furioso

# Para sair, pressione Ctrl+B e depois pressione 'x'