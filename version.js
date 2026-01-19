// version.js - Informations de version (fichier statique)
// Ce fichier est généré par le script de déploiement

const versionInfo = {
  major: 1,
  minor: 0,
  branch: "dev",
  hash: "abc1234",
  date: "260119",
  datetime: "260119 - 143055",
  
  getFullVersion: function() {
    return `${this.major}.${this.minor} ${this.branch} ${this.date}`;
  },
  
  getShortVersion: function() {
    return `v${this.major}.${this.minor} ${this.branch} ${this.hash}`;
  },
  
  getDateTime: function() {
    return this.datetime;
  }
};