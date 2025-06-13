const { readFileSync } = require('fs');

class ServicoCalculoFatura {

  formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR",
      { style: "currency", currency: "BRL",
        minimumFractionDigits: 2 }).format(valor/100);
  }

  getPeca(pecas, apre) {
    return pecas[apre.id];
  }

  calcularCredito(pecas, apre) {  
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.getPeca(pecas, apre).tipo === "comedia") 
        creditos += Math.floor(apre.audiencia / 5);
    return creditos;   
  }

  calcularTotalCreditos(pecas, apresentacoes) {
    let totalCreditos = 0;
    for (let apre of apresentacoes) { 
      totalCreditos += this.calcularCredito(pecas, apre);
    }
    return totalCreditos;
  }

  calcularTotalApresentacao(pecas, apre) {
    let total = 0;

    switch (this.getPeca(pecas, apre).tipo) {
    case "tragedia":  
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
        throw new Error(`Peça desconhecia: ${this.getPeca(pecas, apre).tipo}`);
    }
    return total 
  }

  calcularTotalFatura(pecas, apresentacoes) {
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(pecas, apre);
    }
    return totalFatura;
  }

}



function gerarFaturaStr (fatura, pecas, calc) {
    let faturaStr = `Fatura ${fatura.cliente}\n`;

    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${calc.getPeca(pecas, apre).nome}: ${calc.formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${calc.formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr;
}  
  
function gerarFaturaHTML(fatura, pecas, calc) {
    let htmlStr = `<html>\n`;
    htmlStr += `<p> Fatura ${fatura.cliente} </p>\n`;
    htmlStr += `<ul>\n`;

    for (let apre of fatura.apresentacoes) {
        htmlStr += `<li>  ${calc.getPeca(pecas, apre).nome}: ${calc.formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
    }
    htmlStr += `</ul>\n`;
    htmlStr += `<p> Valor total: ${calc.formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
    htmlStr += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
    htmlStr += `</html>`;
    return htmlStr;
}

const calc = new ServicoCalculoFatura();
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
const faturaHTML = gerarFaturaHTML(faturas, pecas, calc);
console.log(faturaStr);
console.log(faturaHTML);
