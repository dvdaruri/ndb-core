import { TestBed } from "@angular/core/testing";

import { DatabaseResolverService } from "./database-resolver.service";
import { SessionInfo } from "../session/auth/session-info";
import { MemoryPouchDatabase } from "./pouchdb/memory-pouch-database";
import { Entity } from "../entity/model/entity";
import { DatabaseFactoryService } from "./database-factory.service";

describe("DatabaseResolverService", () => {
  let service: DatabaseResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DatabaseFactoryService,
          useValue: { createDatabase: () => new MemoryPouchDatabase() },
        },
      ],
    });
    service = TestBed.inject(DatabaseResolverService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should create a pouchdb with the username of the logged in user", async () => {
    const defaultDb = service.getDatabase();
    spyOn(defaultDb, "init");

    await service.initDatabasesForSession({ name: "test-user" } as SessionInfo);

    expect(defaultDb.init).toHaveBeenCalledWith(
      "test-user" + "-" + Entity.DATABASE,
    );
  });
});
