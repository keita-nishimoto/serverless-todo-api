import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import InternalServerError from "../errors/InternalServerError";
import {Logger} from "../infrastructures/Logger";
import GetItemOutput = DocumentClient.GetItemOutput;
import {TodoResponse} from "../domain/TodoResponse";
import NotFoundError from "../errors/NotFoundError";
//import FindResponse = TodoResponse.FindResponse;
//import FindAllResponse = TodoResponse.FindAllResponse;

/**
 * Repository
 *
 * @author keita-nishimoto
 * @since 2017-07-02
 */
export default class TodoRepository {

  /**
   * @param dynamoDbDocumentClient
   */
  constructor(private dynamoDbDocumentClient: DocumentClient) {
  }

  /**
   * TODOを作成する
   *
   * @param createParams
   * @returns {Promise<TodoResponse.CreateResponse>}
   */
  public async create(createParams: TodoResponse.CreateResponse): Promise<TodoResponse.CreateResponse> {
    try {
      const params = {
        TableName: this.getTableName(),
        Item: createParams,
      };

      await this.dynamoDbDocumentClient.put(params).promise();

      return createParams;
    } catch (error) {
      Logger.critical(error);
      return Promise.reject(
        new InternalServerError(error.message),
      );
    }
  }

  /**
   * TODOを1件取得する
   *
   * @param id
   * @returns {Promise<TodoResponse.FindResponse>}
   */
  public find(id: string): Promise<TodoResponse.FindResponse> {
    return new Promise<TodoResponse.FindResponse>((resolve, reject) => {
      const params = {
        TableName: this.getTableName(),
        Key: {
          id,
        },
      };

      this.dynamoDbDocumentClient
        .get(params)
        .promise()
        .then((getItemOutput: GetItemOutput) => {

          if (getItemOutput.Item == null) {
            return reject(new NotFoundError());
          }

          const findResponse: TodoResponse.FindResponse = {
            id: getItemOutput.Item["id"],
            title: getItemOutput.Item["title"],
            isCompleted: getItemOutput.Item["isCompleted"],
            createdAt: getItemOutput.Item["createdAt"],
            updatedAt: getItemOutput.Item["updatedAt"],
          };

          return resolve(findResponse);
        })
        .catch((error) => {
          Logger.critical(error);
          return reject(
            new InternalServerError(error.message),
          );
        });
    });
  }

  /**
   * TODOを全て取得する
   *
   * @returns {Promise<TodoResponse.FindAllResponse>}
   */
  public findAll(): Promise<TodoResponse.FindAllResponse> {
    return new Promise<TodoResponse.FindAllResponse>((resolve, reject) => {
      const params = {
        TableName: this.getTableName(),
        Limit: 100,
      };

      this.dynamoDbDocumentClient
        .scan(params)
        .promise()
        .then((scanOutput) => {
          if (scanOutput.Items == null) {
            return reject(new NotFoundError());
          }

          const todoItems = scanOutput.Items.map((todo) => {
            const findResponse: TodoResponse.FindResponse = {
              id: todo["id"],
              title: todo["title"],
              isCompleted: todo["isCompleted"],
              createdAt: todo["createdAt"],
              updatedAt: todo["updatedAt"],
            };

            return findResponse;
          });

          const todoListResponse: TodoResponse.FindAllResponse = {
            items: todoItems
          };

          return resolve(todoListResponse);
        })
        .catch((error) => {
          Logger.critical(error);
          return reject(
            new InternalServerError(error.message),
          );
        });
    });
  }

  /**
   * 実行環境のテーブル名を取得する
   *
   * @returns {string}
   */
  private getTableName(): string {
    const tableName = process.env.TODOS_TABLE_NAME;

    return typeof tableName === "string" ? tableName : "";
  }
}

