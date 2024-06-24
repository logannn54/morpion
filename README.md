# Application Morpion

Ce projet regroupe plusieurs TD afin de mettre en place des jeux de morpions de plusieurs façons. \
Pour ce projet, il est préférable d'utiliser Debian 12 et d'avoir déjà installé Node.js, npm, Docker et Docker-compose.

# Installation du projet

Téléchargez le projet soit avec un git clone : ```git clone https://github.com/logannn54/morpion.git``` \
Soit directement en téléchargeant le projet en zip. \
Une fois installé il faut se déplacé dans le répertoire morpion avec la commande : ```cd morpion```

# Lancement du docker-compose

Pour lancer Docker-compose, il est possible de faire la commande : ```docker compose up --build -d``` \
Cela permet de lancer PostgreSQL et Redis qui vont être utilisés pour le projet.

# Installation des dépendances

Pour ce projet, un certain nombre de dépendances sont nécessaires et peuvent être installées avec la commande : ```npm install``` \
Cela crée un dossier nommé node_modules avec toutes les dépendances nécessaires.

# Lancement du serveur backend

Une fois toutes les dépendances téléchargées, il est possible de lancer le serveur backend à l'aide de la commande : ```node script.js``` \
Cela permet de répondre aux TD 3, 7 et 8 en se connectant à [http://localhost:3000](http://localhost:3000) \
À cette étape, il est déjà possible de jouer au morpion.

# Lancement de React
Avec un autre terminal dans le répertoire morpion, il est possible de lancer React avec la commande : ```npm start``` \
Cela lance React directement sur le port 3001 pour éviter les conflits avec le serveur et est accessible en se connectant sur [http://localhost:3001](http://localhost:3001) \
Avec cette étape, il est possible de répondre aux TD 9 et 11 mais pour le 11, un compteur de parties simple a été mis en place car je n'ai pas réussi à faire fonctionner totalement Redis.
