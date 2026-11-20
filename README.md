---

Processo de aprendizagem e transferência com dataset de imagens.

Topicos:
- Codigo e suas funções.
- Detalhes do processo.

-Funções do codigo passo a passo:

a. É importado as bibliotecas e instalado o que precisa.
b. Definido o dataset usado (cachorros vs gatos) e printado como Salvo ao final.
c. train_split e val_split é definido para treinamento e validação, respectivamente 70% e 15% (os outros 15% são para teste).
d. A função de redimensionamento e preparação é definida, e percorrido todas as imagens e randomizadas.
e. Então elas são divididas para suas respectivas funções (70, 15, 15), e definida para os rótulos e convertidas em vetores e por fim tudo isso é impresso.
f. O modelo é montado e exibido com seus parâmetros e é iniciado o treinamento de base 0 (10 épocas), exibindo junto sua acurácia.
g. Após o modelo de treinamento base ser efetuado, é ilustrado a acurácia de validação com sua perda ao longo das épocas (o model.evaluate testa o modelo).
h. Então é carregado o modelo de transferência de rede pré-treinada exibindo sua arquitetura e parâmetros.
i. É feita uma nova camada ligada à penúltima como um novo modelo e congelado mantendo apenas a nova camada treinável, sendo compilada.
j. O model_new.fit treina o novo modelo com a transferência de aprendizagem e o valida (10 épocas), salvando em history2.
k. Então é comparado os modelos para verificação lado a lado. E medido a perda e a acurácia do novo modelo no teste e exibido.
l. Por fim é carregado uma imagem com probabilidades.

Detalhes:

- O Colab deve estar conectado idealmente em GPU com T4, caindo de horas para minutos no tempo de execução (na minha execução com CPU no Colab, passou de quase 2 horas só rodando e chegaria perto de 3 horas).
- As épocas podem ser alteradas de acordo com o objetivo ou tempo.
- O dataset usado é Cats vs Dogs disponivel em: [Cats vs Dogs](https://www.tensorflow.org/datasets/catalog/cats_vs_dogs?hl=pt)


