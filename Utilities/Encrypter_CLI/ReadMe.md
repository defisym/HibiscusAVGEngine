# Encrypter_CLI

based on [Encrypter](https://github.com/defisym/OpenFusionExamples/tree/master/Extensions/Encrypter), works exactly the same as [Encrypter GUI](https://github.com/defisym/HibiscusAVGEngine/tree/main/Utilities/Encrypter), but make it possible to integrate into batch files, like [ContentGenerator](https://github.com/defisym/HibiscusAVGEngine/tree/main/Utilities/ContentGenerator)

| Command           | type   | Info                                                     |
| ----------------- | ------ | -------------------------------------------------------- |
| -f, --fileName    | option | file to process                                          |
| -o, --outFileName | option | output file name, if not set, will overwrite source file |
| -k, --key         | option | encrypt key, used for encrypt/decrypt                    |
| -e, --encrypt     | flag   | encrypt file                                             |
| -d, --decrypt     | flag   | decrypt file                                             |
| --hash            | flag   | get file hash                                            |
