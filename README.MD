#RZTableWidget

Este widget cria exibições de dados na forma de tabela

Depenências:
RZClientEngine >=0.0.1;

pode ser baixado via npm adicionando-se:

```html
"dependencies": {
    "RZClientEngine": "git+https://tributus@bitbucket.org/tributus/rzclientengine.git"
}
```

no arquivo package.json

##Parâmetros de inicialização:

Parâmetro|Descrição|Default
--- | --- | ---
tableClass|classe utilizada na declaração *table*. Os valores deste parâmetro obedecem as regras do semantic-ui. **Exemplos:** `'ui celled table,ui celled padded table','ui stripped table','ui very basic collapsing celled table'`| `ui celled table` 
rowsDta|dados da tabela. pode ser um objeto ou a url de  um serviço [melhorar esta definição]|`undefined`
renderTableHead|define se o cabeçalho da tabela será renderizado|`true`
columns|definição de colunas|`undefined`