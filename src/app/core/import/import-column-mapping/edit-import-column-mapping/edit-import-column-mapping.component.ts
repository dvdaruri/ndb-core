import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { ColumnMapping } from "../../column-mapping";
import { EntityConstructor } from "../../../entity/model/entity";
import { FormFieldConfig } from "../../../common-components/entity-form/FormConfig";
import { DefaultDatatype } from "../../../entity/default-datatype/default.datatype";
import { MatDialog } from "@angular/material/dialog";
import { ComponentRegistry } from "../../../../dynamic-components";
import { EntitySchemaService } from "../../../entity/schema/entity-schema.service";
import { MatInputModule } from "@angular/material/input";
import { EntityFieldSelectComponent } from "../../../entity/entity-field-select/entity-field-select.component";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatBadgeModule } from "@angular/material/badge";
import { MappingDialogData } from "../mapping-dialog-data";

/**
 * Component to edit a single imported column's mapping to an entity field
 * (including special transformations, if applicable).
 */
@Component({
  selector: "app-edit-import-column-mapping",
  templateUrl: "./edit-import-column-mapping.component.html",
  styleUrls: ["./edit-import-column-mapping.component.scss"],
  standalone: true,
  imports: [
    MatInputModule,
    EntityFieldSelectComponent,
    FormsModule,
    MatButtonModule,
    MatBadgeModule,
  ],
})
export class EditImportColumnMappingComponent {
  private dialog = inject(MatDialog);
  private componentRegistry = inject(ComponentRegistry);
  private schemaService = inject(EntitySchemaService);

  @Input() set columnMapping(value: ColumnMapping) {
    const newValueString = JSON.stringify(value);
    if (newValueString === JSON.stringify(this._columnMapping)) {
      return;
    }
    this._columnMapping = JSON.parse(newValueString);
  }

  get columnMapping(): ColumnMapping {
    return this._columnMapping;
  }

  /** internal deep-copy to not change properties of object by reference */
  private _columnMapping: ColumnMapping;

  @Input() entityCtor: EntityConstructor;

  /**
   * Entity fields that are already mapped and should not be offered to the user for selecting here.
   */
  @Input() usedPropertyNames: Set<string>;

  /**
   * the actually imported data
   * (to let this component configure special transformations, e.g. to map values to dropdown categories)
   */
  @Input() rawData: any[];

  @Output() columnMappingChange = new EventEmitter<ColumnMapping>();

  currentlyMappedDatatype: DefaultDatatype;

  /** warning label badges for a mapped column that requires user configuration for the "additional" details */
  mappingAdditionalWarning: string;

  hideOption = (option: FormFieldConfig) =>
    this.usedPropertyNames.has(option.id) &&
    option.id !== this.columnMapping.propertyName;

  async openMappingComponent() {
    const uniqueValues = new Set<any>();
    this.rawData.forEach((obj) =>
      uniqueValues.add(obj[this.columnMapping.column]),
    );

    const configComponent = await this.componentRegistry.get(
      this.currentlyMappedDatatype.importConfigComponent,
    )();

    this.dialog
      .open<any, MappingDialogData>(configComponent, {
        data: {
          col: this.columnMapping,
          values: [...uniqueValues],
          entityType: this.entityCtor,
        },
        width: "80vw",
        disableClose: true,
      })
      .afterClosed()
      .subscribe(() => this.updateMapping(true));
  }

  updateMapping(settingAdditional = false) {
    if (!settingAdditional) {
      delete this.columnMapping.additional;
    }

    this.updateDatatypeAndWarning();
    this.columnMappingChange.emit(this.columnMapping);
  }

  private updateDatatypeAndWarning() {
    const schema = this.entityCtor.schema.get(this.columnMapping.propertyName);
    this.currentlyMappedDatatype = schema
      ? this.schemaService.getDatatypeOrDefault(schema.dataType)
      : null;
    this.mappingAdditionalWarning =
      this.currentlyMappedDatatype?.importIncompleteAdditionalConfigBadge?.(
        this.columnMapping,
      );
  }
}
