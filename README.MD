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

|  Parâmetro  |  Descrição                                     | Default                                              |
|-------------|------------------------------------------------|------------------------------------------------------|
|tableClass   |classe utilizada na declaração *table*. Os      |                                                      | 
|             |valores deste parâmetro obedecem as regras do   |                                                      |
|             |semantic-ui.                                    |  ui celled table                                     |
|             |Exemplos:                                       |                                                      |
|             |  ui celled table,ui celled padded table        |                                                      |
|             |  ui stripped table                             |                                                      |
|             |  ui very basic collapsing celled table         |                                                      |
|             |                                                |                                                      |
|rowsDta      |dados da tabela. pode ser um objeto ou a url de |                                                      |
|             |um serviço [melhorar esta definição]            |                                                      |
|             |                                                |                                                      |
|             |                                                |                                                      |
|             |                                                |                                                      |


Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders loren ipsum dolor sit amet renders loren ipsum dolor sit amet renders loren ipsum dolor sit amet renders loren ipsum dolor sit amet` | **nicely**
1 | 2 | 3