import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { ColumnMapping } from "../column-mapping";
import { EntityRegistry } from "../../entity/database-entity.decorator";
import { EntityConstructor } from "../../entity/model/entity";
import { HelpButtonComponent } from "../../common-components/help-button/help-button.component";
import { NgForOf } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatBadgeModule } from "@angular/material/badge";
import { ImportColumnMappingService } from "./import-column-mapping.service";
import { EditImportColumnMappingComponent } from "./edit-import-column-mapping/edit-import-column-mapping.component";

/**
 * Import sub-step: Let user map columns from import data to entity properties
 * and define value matching and transformations.
 */
@Component({
  selector: "app-import-column-mapping",
  templateUrl: "./import-column-mapping.component.html",
  styleUrls: ["./import-column-mapping.component.scss"],
  imports: [
    EditImportColumnMappingComponent,
    HelpButtonComponent,
    NgForOf,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatBadgeModule,
  ],
})
export class ImportColumnMappingComponent implements OnChanges {
  @Input() rawData: any[] = [];
  @Input() columnMapping: ColumnMapping[] = [];
  @Output() columnMappingChange = new EventEmitter<ColumnMapping[]>();

  entityCtor: EntityConstructor;
  usedPropertyNames: Set<string> = new Set();

  @Input() set entityType(value: string) {
    if (!value) {
      return;
    }
    this.entityCtor = this.entities.get(value);
  }

  constructor(
    private entities: EntityRegistry,
    private importColumnMappingService: ImportColumnMappingService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.columnMapping) {
      const autoMappings =
        this.importColumnMappingService.automaticallySelectMappings(
          JSON.parse(JSON.stringify(this.columnMapping)),
          this.entityCtor.schema,
        );
      if (JSON.stringify(autoMappings) !== JSON.stringify(this.columnMapping)) {
        this.columnMapping = autoMappings;
        this.columnMappingChange.emit([...this.columnMapping]);
      }
      this.updateUsedPropertyNames();
    }
  }

  /**
   * Check which fields are already used in a mapping.
   * @private
   */
  private updateUsedPropertyNames(): void {
    this.usedPropertyNames.clear();
    for (const col of this.columnMapping) {
      if (col.propertyName) {
        this.usedPropertyNames.add(col.propertyName);
      }
    }
  }

  updateColumnMapping(
    originalColumnMapping: ColumnMapping,
    newColumnMapping: ColumnMapping,
  ) {
    Object.assign(originalColumnMapping, newColumnMapping);

    this.columnMappingChange.emit([...this.columnMapping]);
  }
}
