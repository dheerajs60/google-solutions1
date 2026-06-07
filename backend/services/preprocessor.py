import pandas as pd
import numpy as np

def preprocess_data(df: pd.DataFrame, target_column: str, sensitive_attributes: list) -> tuple[pd.DataFrame, list[str]]:
    log = []
    
    # 0. Clean column names and input keys
    df.columns = df.columns.str.strip()
    target_column = target_column.strip()
    sensitive_attributes = [attr.strip() for attr in sensitive_attributes]
    
    # 1. Validate columns
    missing_cols = [col for col in sensitive_attributes + [target_column] if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Columns not found in dataset: {missing_cols}. Available columns: {list(df.columns)}")
        
    # 2. Convert standard string-based nulls to np.nan
    # Replace empty strings and common missing value markers
    df.replace(to_replace=r'^\s*(\?|NA|N/A|null|None|)\s*$', value=np.nan, regex=True, inplace=True)
    
    # Strip whitespaces from object columns
    for col in df.select_dtypes(['object', 'string']).columns:
        mask = df[col].notna()
        df.loc[mask, col] = df.loc[mask, col].astype(str).str.strip()
        
    # Re-infer types now that strings are cleaned and NaNs injected
    for col in df.columns:
        if col != target_column and col not in sensitive_attributes:
            try:
                df[col] = pd.to_numeric(df[col])
            except (ValueError, TypeError):
                pass

    # 3. Drop rows where target is null
    initial_rows = len(df)
    df = df.dropna(subset=[target_column])
    dropped_rows = initial_rows - len(df)
    if dropped_rows > 0:
        log.append(f"Dropped {dropped_rows} rows with missing target values '{target_column}'")

    if len(df) == 0:
        raise ValueError("Dataset is empty after dropping missing target values.")

    # 4. Fill missing values
    for col in df.columns:
        if col == target_column:
            continue
            
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            if pd.api.types.is_numeric_dtype(df[col]):
                median_val = df[col].median()
                if pd.isna(median_val):  # Handle completely null columns
                    median_val = 0.0
                df[col] = df[col].fillna(median_val)
                log.append(f"Filled {missing_count} missing values in numeric column '{col}' with median {median_val:.2f}")
            else:
                if df[col].mode().empty:
                    mode_val = "Unknown"
                else:
                    mode_val = df[col].mode()[0]
                df[col] = df[col].fillna(mode_val)
                log.append(f"Filled {missing_count} missing values in categorical column '{col}' with mode '{mode_val}'")
                
    # 5. Encode categorical columns (except target)
    for col in df.columns:
        if col != target_column:
            if not pd.api.types.is_numeric_dtype(df[col]):
                # Convert to codes but KEEP the column name the same for bias analysis
                df[col] = pd.Categorical(df[col]).codes
                log.append(f"Encoded categorical column '{col}' to numeric")
                
    return df, log
