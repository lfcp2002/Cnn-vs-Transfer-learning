# Comparação de rede neural convolucional treinada do zero com o Transfer Learning

## Tópicos
- Código e suas funções.
- Detalhes do processo.

---

## Código e suas funções

- **1.** São importadas as bibliotecas e instalado o que precisa.
- **2.** Definido o dataset usado (cachorros vs gatos) e printado como Salvo ao final.
- **3.** `train_split` e `val_split` são definidos para treinamento e validação, respectivamente 70% e 15% (os outros 15% são para teste).
- **4.** A função de redimensionamento e preparação é definida, e percorridas todas as imagens e randomizadas.
- **5.** Então elas são divididas para suas respectivas funções (70, 15, 15), e definida para os rótulos e convertidas em vetores e por fim tudo isso é impresso.
- **6.** O modelo é montado e exibido com seus parâmetros e é iniciado o treinamento de base 0 (10 épocas), exibindo junto sua acurácia.
- **7.** Após o modelo de treinamento base ser efetuado, é ilustrada a acurácia de validação com sua perda ao longo das épocas (o `model.evaluate` testa o modelo).
- **8.** Então é carregado o modelo de transferência de rede pré-treinada exibindo sua arquitetura e parâmetros.
- **9.** É feita uma nova camada ligada à penúltima como um novo modelo e congelado mantendo apenas a nova camada treinável, sendo compilada.
- **10.** O `model_new.fit` treina o novo modelo com a transferência de aprendizagem e o valida (10 épocas), salvando em `history2`.
- **11.** Então são comparados os modelos para verificação lado a lado. E medidos a perda e a acurácia do novo modelo no teste e exibidos.
- **l2.** Por fim é carregada uma imagem com probabilidades.

---

## Detalhes do processo

- **1.** O Colab deve estar conectado idealmente em GPU com T4, caindo de horas para minutos no tempo de execução (em um teste de execução com CPU no Colab, passou de 3 horas).
- **2.** As épocas podem ser alteradas de acordo com o objetivo ou tempo.
- **3.** O dataset usado é Cats vs Dogs disponível em: https://www.tensorflow.org/datasets/catalog/cats_vs_dogs
